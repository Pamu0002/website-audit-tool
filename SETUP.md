# Setup Guide - AI Website Audit Tool

## Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- Git
- API Key (Groq or OpenAI)

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Pamu0002/website-audit-tool.git
cd website-audit-tool
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Configure Environment Variables ⚠️ IMPORTANT

Create a `.env` file in the **root directory** with your API key:

**Option A: Using Groq (Recommended - Free)**
```
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
AI_PROVIDER=groq
GROQ_MODEL=llama-3.3-70b-versatile
PORT=3000
NODE_ENV=development
```

Get Groq API key: https://console.groq.com/

**Option B: Using OpenAI (Paid)**
```
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
PORT=3000
NODE_ENV=development
```

Get OpenAI API key: https://platform.openai.com/api/keys

### 4. Start the Backend Server
```bash
npm run dev
```

You should see:
```
Server running on http://localhost:3000
```

### 5. Start the Frontend (In a new terminal)
```bash
cd frontend
npm install
npm run dev
```

You should see:
```
VITE v8.0.1 ready in XXX ms
Local: http://localhost:5173
```

### 6. Access the Tool
Open your browser and go to: **http://localhost:5173**

## Usage

1. Enter a website URL (e.g., `https://example.com`)
2. Click "Run Audit"
3. View the results:
   - **Metrics**: Factual data extracted from the page
   - **AI Insights**: AI-powered analysis (SEO, Messaging, CTA, Depth, UX)
   - **Recommendations**: Prioritized actionable improvements
4. Click "Copy Prompt Logs" to see the AI prompts and responses

## Troubleshooting

**"AI API key not configured" error?**
- Make sure `.env` file exists in the root directory
- Check that `GROQ_API_KEY` or `OPENAI_API_KEY` is set correctly
- Restart the backend (`npm run dev`)

**Port already in use?**
- Backend default: 3000
- Frontend default: 5173
- Change in `.env` (PORT=xxxx) or kill existing processes

**Module not found errors?**
- Run `npm install` in both root and frontend directories
- Delete `node_modules` and `package-lock.json`, then reinstall

## Testing

Run the test suite:
```bash
npm test
```

Expected output: `Test Files 2 passed (2)`

## File Structure
```
website-audit-tool/
├── src/
│   ├── server.js          # Express API
│   ├── scraper.js         # Web scraper
│   ├── ai.js              # AI integration
│   ├── config.js          # Env config
│   └── *.test.js          # Tests
├── frontend/              # React + Vite app
├── logs/                  # AI prompt logs
├── .env                   # Environment variables (NOT in Git)
├── .gitignore             # Excludes .env and node_modules
├── README.md              # Project overview
├── PROJECT_PROPOSAL.md    # Design document
└── SETUP.md              # This file
```

## API Endpoints

### POST /audit
Audit a single webpage

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "metrics": {
    "wordCount": 1234,
    "headings": {"h1": 1, "h2": 5, "h3": 3},
    "ctaCount": 4,
    "links": {"total": 20, "internal": 15, "external": 5},
    "images": {"total": 10, "missingAlt": 2, "missingAltPercent": 20},
    "meta": {"title": "...", "description": "..."},
    "sampleText": "..."
  },
  "aiInsights": {
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

## Support

For issues or questions:
1. Check the README.md
2. Check the PROJECT_PROPOSAL.md for architecture details
3. Review test files in `src/`

---
**Last Updated:** March 22, 2026
