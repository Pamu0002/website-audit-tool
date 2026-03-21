import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { z } from 'zod';
import { aiAnalyze } from './ai.js';
import { extractMetrics, fetchPage } from './scraper.js';

dotenv.config();

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Schema for audit request
const auditRequestSchema = z.object({
  url: z.string().url('Invalid URL format')
});

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

app.post('/audit', async (req, res) => {
  const parsedRequest = auditRequestSchema.safeParse(req.body);
  if (!parsedRequest.success) {
    return res.status(400).json({ error: 'Validation error', details: parsedRequest.error.errors });
  }

  try {
    const { url } = parsedRequest.data;

    const html = await fetchPage(url);
    const metrics = extractMetrics(html, url);
    const ai = await aiAnalyze(metrics);

    // Validate AI response
    const validatedAi = aiResponseSchema.safeParse(ai.ai);
    if (!validatedAi.success) {
      return res.status(502).json({
        error: 'AI output validation failed',
        details: validatedAi.error.errors,
        metrics,
        aiInsights: ai
      });
    }

    res.json({
      metrics,
      aiInsights: { ...ai, ai: validatedAi.data }
    });
  } catch (error) {
    console.error('Audit failed', error);
    res.status(500).json({ error: error?.message || 'unexpected error', details: error?.stack });
  }
});

app.get('/', (req, res) => {
  res.send({ status: 'ok', msg: 'AI Website Audit API. POST /audit {url}.' });
});

const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default app;
