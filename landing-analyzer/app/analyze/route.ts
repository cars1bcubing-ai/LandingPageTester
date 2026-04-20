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

    // Use Jina AI reader — renders JS, returns clean markdown text
    // Free, no API key needed, handles SPAs and modern landing pages
    const jinaUrl = `https://r.jina.ai/${url}`;

    let pageContent: string;
    try {
      const response = await fetch(jinaUrl, {
        headers: {
          Accept: "text/plain",
          "X-Return-Format": "text",
        },
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        return NextResponse.json(
          {
            error: `Could not fetch the page (HTTP ${response.status}). Make sure the URL is publicly accessible.`,
          },
          { status: 422 }
        );
      }

      const raw = await response.text();

      // Jina prepends metadata lines like "Title: ...\nURL: ...\n" — strip those
      const cleaned = raw
        .replace(/^(Title|URL|Description):.*$/gim, "")
        .replace(/\s{3,}/g, "\n\n")
        .trim();

      pageContent = cleaned.slice(0, 12000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      const isTimeout = msg.includes("timeout") || msg.includes("abort");
      return NextResponse.json(
        {
          error: isTimeout
            ? "Request timed out — the page took too long to load."
            : `Could not reach the URL: ${msg}`,
        },
        { status: 422 }
      );
    }

    if (pageContent.length < 50) {
      return NextResponse.json(
        {
          error:
            "Could not extract meaningful content from this page. It may be behind a login or heavily restricted.",
        },
        { status: 422 }
      );
    }

    // Send to Claude
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a senior CRO (conversion rate optimization) consultant with 15 years of experience auditing landing pages for SaaS, e-commerce, and lead-gen businesses.

Analyze the following landing page content and score it on four dimensions:
- **Clarity** (0-100): Is the value proposition instantly understandable? Is the page scannable?
- **Offer** (0-100): Is the offer compelling, differentiated, and clearly stated?
- **Trust** (0-100): Are there social proof, testimonials, guarantees, credentials, or trust signals?
- **CTA** (0-100): Is the call-to-action prominent, specific, and persuasive?

Calculate an **overall_score** as a weighted average (clarity 25%, offer 30%, trust 25%, cta 20%).

Be honest and critical — don't inflate scores. A page with no testimonials should score low on trust. A vague headline should score low on clarity.

Return ONLY valid JSON — no markdown, no explanation outside the JSON — in this exact schema:
${ANALYSIS_SCHEMA}

Landing page content:
---
${pageContent}
---`,
        },
      ],
    });

    const rawText = message.content
      .filter((b) => b.type === "text")
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
