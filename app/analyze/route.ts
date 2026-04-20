import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const ANALYSIS_SCHEMA = `{
  "overall_score": number (0-100),
  "clarity_score": number (0-100),
  "offer_score": number (0-100),
  "trust_score": number (0-100),
  "cta_score": number (0-100),
  "summary": "1-2 sentence overview",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "suggestions": ["actionable fix 1", "actionable fix 2", "actionable fix 3"]
}`;

async function takeScreenshots(url: string): Promise<string[]> {
  // Dynamic imports so the heavy chromium binary is only loaded server-side
  const chromium = (await import("@sparticuz/chromium-min")).default;
  const puppeteer = (await import("puppeteer-core")).default;

  // Chromium binary streamed from GitHub at runtime — keeps bundle size small
  const CHROMIUM_URL =
    "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar";

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1280, height: 900 },
    executablePath: await chromium.executablePath(CHROMIUM_URL),
    headless: true,
  });

  const page = await browser.newPage();

  // Block heavy assets we don't need for visual analysis
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const type = req.resourceType();
    if (["font", "media", "websocket"].includes(type)) {
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.goto(url, { waitUntil: "networkidle2", timeout: 25000 });

  // Small pause for any CSS transitions / lazy images
  await new Promise((r) => setTimeout(r, 1500));

  const screenshots: string[] = [];

  // Screenshot 1: above the fold (hero)
  const hero = await page.screenshot({ type: "jpeg", quality: 80, encoding: "base64" });
  screenshots.push(hero as string);

  // Screenshot 2: scroll down one viewport for social proof / features
  await page.evaluate(() => window.scrollBy(0, 900));
  await new Promise((r) => setTimeout(r, 800));
  const mid = await page.screenshot({ type: "jpeg", quality: 80, encoding: "base64" });
  screenshots.push(mid as string);

  // Screenshot 3: scroll to bottom for CTA / footer trust signals
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise((r) => setTimeout(r, 800));
  const bottom = await page.screenshot({ type: "jpeg", quality: 80, encoding: "base64" });
  screenshots.push(bottom as string);

  await browser.close();
  return screenshots;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required." }, { status: 400 });
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: "Invalid URL. Please include http:// or https://." },
        { status: 400 }
      );
    }

    // Take 3 screenshots: hero, middle, bottom
    let screenshots: string[];
    try {
      screenshots = await takeScreenshots(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json(
        { error: `Could not screenshot the page: ${msg}` },
        { status: 422 }
      );
    }

    // Build image content blocks for Claude vision
    const imageBlocks: Anthropic.ImageBlockParam[] = screenshots.map((b64) => ({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: b64 },
    }));

    // Send screenshots to Claude for visual CRO analysis
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            ...imageBlocks,
            {
              type: "text",
              text: `You are a senior CRO (conversion rate optimization) consultant with 15 years of experience. You have been given 3 screenshots of a landing page (top, middle, bottom) at: ${url}

Analyze the page visually and score it on four dimensions:
- Clarity (0-100): Is the value proposition instantly understandable? Is the layout clean and scannable?
- Offer (0-100): Is the offer compelling, differentiated, and clearly stated?
- Trust (0-100): Are there testimonials, social proof, logos, guarantees, or credentials visible?
- CTA (0-100): Is the call-to-action prominent, specific, visually distinct, and persuasive?

Calculate overall_score as weighted average: clarity 25%, offer 30%, trust 25%, cta 20%.

Be honest and critical based on what you can actually SEE in the screenshots. Don't inflate scores.

Return ONLY valid JSON, no markdown fences, no extra text:
${ANALYSIS_SCHEMA}`,
            },
          ],
        },
      ],
    });

    const rawText = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Claude returned an unexpected response format." },
        { status: 500 }
      );
    }

    const analysis = JSON.parse(jsonMatch[0]);

    const required = [
      "overall_score", "clarity_score", "offer_score", "trust_score",
      "cta_score", "summary", "strengths", "weaknesses", "suggestions",
    ];
    for (const field of required) {
      if (!(field in analysis)) {
        return NextResponse.json(
          { error: `Missing field in analysis response: ${field}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ analysis, url });
  } catch (err: unknown) {
    console.error("Analyze error:", err);
    const msg = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
