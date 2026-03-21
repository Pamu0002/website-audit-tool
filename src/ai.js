import fs from 'fs';
import OpenAI from 'openai';
import { z } from 'zod';

function getAiClientConfig() {
  const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();

  if (provider === 'groq') {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return { provider, client: null, model: 'llama-3.3-70b-versatile' };
    }

    return {
      provider,
      client: new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' }),
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { provider: 'openai', client: null, model: 'gpt-4o-mini' };
  }

  return {
    provider: 'openai',
    client: new OpenAI({ apiKey }),
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
  };
}

// Schema for AI response
const aiResponseSchema = z.object({
  analysis: z.object({
    seo: z.string(),
    messaging: z.string(),
    cta: z.string(),
    depth: z.string(),
    ux: z.string()
  }),
  recommendations: z.array(z.string()),
  warning: z.string().optional()
});

function makeSystemPrompt() {
  return `You are a website audit analyst for a marketing agency.
Return ONLY valid JSON.
Ground every insight in the provided metrics and sample page text.
Each analysis field must reference concrete facts (counts, percentages, heading structure, links, images, or metadata).
Recommendations must be prioritized from highest to lowest impact and be concise, actionable, and metric-tied.`;
}

function buildStructuredInput(metrics) {
  return {
    url: metrics.url,
    wordCount: metrics.wordCount,
    headings: metrics.headings,
    ctaCount: metrics.ctaCount,
    links: metrics.links,
    images: metrics.images,
    meta: metrics.meta,
    sampleText: metrics.sampleText
  };
}

function parseModelJson(rawText) {
  try {
    return JSON.parse(rawText);
  } catch {
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(rawText.slice(firstBrace, lastBrace + 1));
    }
    throw new Error('No parsable JSON object in model response');
  }
}

export async function aiAnalyze(metrics) {
  const { provider, client, model } = getAiClientConfig();

  if (!client) {
    const fallback = {
      analysis: {
        seo: 'AI API key not configured',
        messaging: 'AI API key not configured',
        cta: 'AI API key not configured',
        depth: 'AI API key not configured',
        ux: 'AI API key not configured'
      },
      recommendations: [
        provider === 'groq'
          ? 'Set GROQ_API_KEY (and AI_PROVIDER=groq) to a valid key and restart the server.'
          : 'Set OPENAI_API_KEY to a valid key and restart the server.'
      ],
      warning: `No ${provider === 'groq' ? 'Groq' : 'OpenAI'} API key. [DEBUG: provider='${provider}', GROQ_KEY=${!!process.env.GROQ_API_KEY}, OPENAI_KEY=${!!process.env.OPENAI_API_KEY}]`
    };
    return ({ prompt: '', rawResponse: '', ai: fallback });
  }

  const systemPrompt = makeSystemPrompt();
  const structuredInput = buildStructuredInput(metrics);
  const userPrompt = `Analyze this webpage and return JSON with this exact shape:
{
  "analysis": {
    "seo": "string",
    "messaging": "string",
    "cta": "string",
    "depth": "string",
    "ux": "string"
  },
  "recommendations": ["string", "string", "string"],
  "warning": "optional string"
}

Rules:
- analysis.seo, messaging, cta, depth, ux must each cite concrete page facts.
- recommendations must be 3 to 5 prioritized actions.
- keep recommendations concise and directly tied to the metrics.

Structured audit input:
${JSON.stringify(structuredInput, null, 2)}`;

  const completionRequest = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 1200
  };

  if (provider === 'openai') {
    completionRequest.response_format = { type: 'json_object' };
  }

  const response = await client.chat.completions.create(completionRequest);

  const rawText = response.choices?.[0]?.message?.content || '';
  
  // Ensure logs directory exists
  if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs', { recursive: true });
  }

  const logEntry = {
    timestamp: new Date().toISOString(),
    provider,
    model,
    systemPrompt,
    userPrompt,
    structuredInput,
    rawResponse: rawText
  };

  fs.appendFileSync('logs/prompt-trace.jsonl', JSON.stringify(logEntry) + '\n');

  let parsed = {
    analysis: {},
    recommendations: [],
    warning: 'Unable to parse JSON from AI response. See rawResponse in logs.'
  };

  try {
    parsed = parseModelJson(rawText);
    // Validate with zod
    parsed = aiResponseSchema.parse(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      parsed.warning = `AI response validation failed: ${error.message}`;
    } else {
      parsed.warning = 'Unable to parse JSON from AI response. See rawResponse in logs.';
    }
  }

  return {
    prompt: userPrompt,
    rawResponse: rawText,
    ai: parsed
  };
}
