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

    // Pass web_search as a tool so Claude fetches the live page itself.
    // This handles JS-rendered SPAs, avoids scraper blocks, and uses web search tokens.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const webSearchTool: any = { type: "web_search_20250305", name: "web_search" };

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2048,
      tools: [webSearchTool],
      messages: [
        {
          role: "user",
          content: `You are a senior CRO (conversion rate optimization) consultant with 15 years of experience auditing landing pages.

Step 1 — Use the web_search tool to fetch and read the content at: ${url}
Step 2 — Analyze it as a landing page and score it across four dimensions:
  - Clarity (0-100): Is the value proposition instantly understandable? Is the page scannable?
  - Offer (0-100): Is the offer compelling, differentiated, and clearly stated?
  - Trust (0-100): Are there testimonials, social proof, guarantees, or credentials?
  - CTA (0-100): Is the call-to-action prominent, specific, and persuasive?

Calculate overall_score as weighted average: clarity 25%, offer 30%, trust 25%, cta 20%.

Be honest and critical — don't inflate scores. No testimonials = low trust score.

After reading the page, respond with ONLY valid JSON, no markdown fences, no extra text:
${ANALYSIS_SCHEMA}`,
        },
      ],
    });

    // Get the final text block — comes after tool use turns
    const rawText = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    if (!rawText) {
      return NextResponse.json(
        { error: "Claude could not retrieve content from this page. It may be login-protected." },
        { status: 422 }
      );
    }

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
