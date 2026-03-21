# AI-Native Website Audit Tool

A lightweight single-page website auditor built for the AI-Native Software Engineer assignment.

## What It Does
- Accepts a single URL
- Extracts factual page metrics (scraping layer)
- Uses AI to generate structured insights and prioritized recommendations (AI layer)
- Returns both factual and AI outputs in structured JSON
- Logs prompt traces for transparency

## Scope
- Single-page analysis only
- No multi-page crawling
- Fast, practical proof of concept (not production crawler)

## Assignment Requirement Mapping
### 1) Factual Metrics (Required)
The tool extracts and returns:
- Total word count
- Heading counts (`h1`, `h2`, `h3`)
- CTA count (buttons + CTA-like links by class heuristic)
- Internal vs external links
- Number of images
- Percent of images missing alt text
- Meta title and meta description

### 2) AI Insights (Required)
The AI returns structured analysis with:
- `seo`
- `messaging`
- `cta`
- `depth`
- `ux`

All fields are explicitly instructed to reference factual metrics and page content.

### 3) Recommendations (Required)
The AI returns 3 to 5 prioritized, concise, actionable recommendations tied to extracted metrics.

### 4) Interface Requirement
Provided interfaces:
- API endpoint (`POST /audit`) for structured output
- Local frontend app (`frontend/`) for manual URL input and result display

### 5) Prompt Logs (Required)
Prompt traces are written to:
- `logs/prompt-trace.jsonl`

Each log entry includes:
- `systemPrompt`
- `userPrompt`
- `structuredInput`
- `rawResponse`
- `model`
- `timestamp`

## Architecture Overview
### Backend
- `src/server.js`: API orchestration, request validation, response shaping
- `src/scraper.js`: page fetch + factual metric extraction
- `src/ai.js`: AI prompt construction, model call, parse/validate AI output, prompt logging

### Frontend (Optional Local UI)
- `frontend/`: Vite + React interface to call `/audit`

## API
### Endpoint
`POST /audit`

### Request Body
```json
{
  "url": "https://example.com"
}
```

### Response Shape
```json
{
  "metrics": {
    "url": "https://example.com",
    "wordCount": 123,
    "headings": { "h1": 1, "h2": 3, "h3": 2 },
    "ctaCount": 4,
    "links": { "total": 20, "internal": 14, "external": 6 },
    "images": { "total": 8, "missingAlt": 2, "missingAltPercent": 25 },
    "meta": { "title": "Page Title", "description": "Meta description" },
    "sampleText": "..."
  },
  "aiInsights": {
    "prompt": "...",
    "rawResponse": "...",
    "ai": {
      "analysis": {
        "seo": "...",
        "messaging": "...",
        "cta": "...",
        "depth": "...",
        "ux": "..."
      },
      "recommendations": ["...", "...", "..."],
      "warning": "optional"
    }
  }
}
```

## Setup
1. Install dependencies:
```bash
npm install
```

2. Create `.env` at repo root:
```env
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=
PORT=3000
```

Notes:
- `AI_PROVIDER=groq` enables a free-tier compatible path for interview demos.
- If you want OpenAI instead, set `AI_PROVIDER=openai` and set `OPENAI_API_KEY`.

3. Run backend:
```bash
npm start
```

4. (Optional) Run frontend:
```bash
cd frontend
npm install
npm run dev
```

## Quick Test
```bash
curl -X POST http://localhost:3000/audit \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

## AI Design Decisions
- Kept scraping and AI concerns in separate modules for clarity and maintainability
- Passed both structured metrics and sample page text to improve grounding
- Enforced JSON response format from model (`response_format: json_object`)
- Validated AI response with Zod schema before returning
- Captured raw model output and prompts for auditability
- Added provider switch (`openai` or `groq`) to support low-cost/free interview execution

## Trade-Offs
- Uses static HTML scraping only (no JS rendering), so JS-heavy pages may be partially analyzed
- CTA detection uses pragmatic heuristics (buttons + CTA-like class names)
- Uses one model call for speed and simplicity (no multi-agent or retrieval chain)
- Fetch timeout may still fail on some blocked/slow sites

## What I Would Improve With More Time
- Add optional headless-browser mode for JS-rendered pages
- Improve CTA detection using text semantics and visual prominence heuristics
- Add confidence scores and evidence citations per insight
- Add retries/backoff and richer network diagnostics for fetch failures
- Add snapshot fixtures and contract tests for known websites
- Add deploy config and hosted demo URL

## Tests
Run tests:
```bash
npm test
```

Current tests cover:
- Metric extraction behavior (`src/scraper.test.js`)
- API route behavior with mocked dependencies (`src/server.test.js`)
