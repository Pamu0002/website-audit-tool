import fs from 'fs';
import OpenAI from 'openai';
import { z } from 'zod';

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

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
  return `You are a precise AI that analyzes website audit metrics and returns structured JSON grounded in the facts.
Focus on SEO structure, messaging clarity, CTA usage, content depth, and UX concerns.
Provide 3-5 prioritized recommendations, each tied to metrics.`;
}

export async function aiAnalyze(metrics) {
  if (!openai) {
    const fallback = {
      analysis: {
        seo: 'OpenAI API key not configured',
        messaging: 'OpenAI API key not configured',
        cta: 'OpenAI API key not configured',
        depth: 'OpenAI API key not configured',
        ux: 'OpenAI API key not configured'
      },
      recommendations: [
        'Set OPENAI_API_KEY to a valid key and restart the server.'
      ],
      warning: 'No OpenAI API key'
    };
    return ({ prompt: '', rawResponse: '', ai: fallback });
  }

  const prompt = `${makeSystemPrompt()}\n\nMetrics: ${JSON.stringify(metrics, null, 2)}`;

  const response = await openai.responses.create({
    model: 'gpt-4o-mini',
    input: prompt,
    max_output_tokens: 1200
  });

  const rawText = response.output_text || response.output?.[0]?.content?.[0]?.text || '';
  const logEntry = {
    timestamp: new Date().toISOString(),
    systemPrompt: makeSystemPrompt(),
    userPrompt: prompt,
    rawResponse: rawText
  };

  fs.appendFileSync('logs/prompt-trace.jsonl', JSON.stringify(logEntry) + '\n');

  let parsed = {
    analysis: {},
    recommendations: [],
    warning: 'Unable to parse JSON from AI response. See rawResponse in logs.'
  };

  try {
    parsed = JSON.parse(rawText);
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
    prompt,
    rawResponse: rawText,
    ai: parsed
  };
}
