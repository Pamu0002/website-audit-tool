# AI Website Audit Tool\n\n## Overview\nThis project is a lightweight AI-powered website audit tool (single URL).\n\n## Features\n- Scrapes a single page and extracts factual metrics (word count, headings, CTAs, links, images alt text, meta tags)\n- Generates structured AI insights and recommendations using OpenAI\n- Separate metric output and AI insights\n- Prompt logging in `logs/prompt-trace.jsonl`\n\n## Setup\n1. Clone repo\n2. `cd ai-website-audit`\n3. `npm install`\n4. Set `.env` with `OPENAI_API_KEY` and optional `PORT`\n5. `npm run dev` or `node src/server.js`\n\n## API\nPOST `/audit` with JSON: `{ "url":"https://example.com" }`\n\n## Example response\n```json
{
  "metrics": { ... },
  "aiInsights": {
    "prompt": "...",
    "rawResponse": "...",
    "ai": { ... }
  }
}
```
\n## Prompt logs\n`logs/prompt-trace.jsonl` holds request/response records.\n
## Tradeoffs\n- No browser rendering (JS-heavy pages may miss content)\n- Single-page only\n- Basic output parsing from OpenAI

## Next steps\n- Integrate schema validator for AI output with zod
- Optional React frontend
- Add tests and CI
