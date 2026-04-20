# LandingLens — CRO Landing Page Analyzer

Paste a URL → Claude audits your landing page like a senior CRO consultant.

**Tech stack:** Next.js 14 (App Router) · Tailwind CSS · Anthropic SDK · Vercel-ready

---

## File Structure

```
landing-page-analyzer/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts          # POST /api/analyze — fetches URL, calls Claude
│   ├── globals.css               # Tailwind + custom CSS + Google Fonts
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Main UI (input, loading, results)
├── components/
│   └── ResultsDashboard.tsx      # Score bars, bullets, copy button
├── .env.example                  # Env template
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## Run Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
```

Open `.env.local` and add your key:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get a key at: https://console.anthropic.com/

### 3. Start the dev server

```bash
npm run dev
```

Open http://localhost:3000

---

## Deploy to Vercel

### Option A — Vercel CLI (fastest)

```bash
npm i -g vercel
vercel
```

When prompted:
- Framework: Next.js (auto-detected)
- Root directory: `./` (or wherever your project lives)

Then add your env variable:
```bash
vercel env add ANTHROPIC_API_KEY
# paste your key when prompted, select all environments
```

Re-deploy to apply:
```bash
vercel --prod
```

### Option B — GitHub + Vercel Dashboard

1. Push this folder to a GitHub repo
2. Go to https://vercel.com/new
3. Import the repo
4. In **Environment Variables**, add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...`
5. Click **Deploy**

---

## API Reference

### POST /api/analyze

**Request:**
```json
{ "url": "https://example.com" }
```

**Success response (200):**
```json
{
  "url": "https://example.com",
  "analysis": {
    "overall_score": 72,
    "clarity_score": 80,
    "offer_score": 65,
    "trust_score": 60,
    "cta_score": 88,
    "summary": "Strong CTA and clear value prop, but trust signals are thin.",
    "strengths": ["Clear headline", "Single focused CTA", "Fast load feel"],
    "weaknesses": ["No testimonials", "Vague pricing", "Missing social proof"],
    "suggestions": ["Add 3 customer testimonials above the fold", "Include a money-back guarantee", "Clarify pricing or add a free trial CTA"]
  }
}
```

**Error response (4xx/5xx):**
```json
{ "error": "Could not reach the URL: ..." }
```

---

## Scores explained

| Score | Range | Color |
|-------|-------|-------|
| Excellent | 80–100 | 🟢 Green |
| Good | 65–79 | 🟢 Green |
| Average | 45–64 | 🟡 Yellow |
| Weak | 25–44 | 🔴 Red |
| Poor | 0–24 | 🔴 Red |

- **Clarity** — Is the value prop instantly understandable?
- **Offer** — Is the offer compelling and differentiated?
- **Trust** — Testimonials, guarantees, credentials present?
- **CTA** — Is the call-to-action prominent and specific?
- **Overall** — Weighted: offer 30%, clarity 25%, trust 25%, CTA 20%

---

## Notes

- Works on publicly accessible pages only (no auth-gated pages)
- Page content is trimmed to ~10,000 characters before sending to Claude
- Scripts, styles, and SVGs are stripped; only visible text is analyzed
- The Anthropic API call uses `claude-opus-4-5` — swap to `claude-haiku-4-5-20251001` in `route.ts` for lower cost
