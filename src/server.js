import dotenv from 'dotenv';
import express from 'express';
import { z } from 'zod';
import { aiAnalyze } from './ai.js';
import { extractMetrics, fetchPage } from './scraper.js';

dotenv.config();

const app = express();
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
  try {
    // Validate request
    const { url } = auditRequestSchema.parse(req.body);

    const html = await fetchPage(url);
    const metrics = extractMetrics(html, url);
    const ai = await aiAnalyze(metrics);

    // Validate AI response
    const validatedAi = aiResponseSchema.parse(ai.ai);

    res.json({
      metrics,
      aiInsights: { ...ai, ai: validatedAi }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      console.error('Audit failed', error);
      res.status(500).json({ error: error?.message || 'unexpected error', details: error?.stack });
    }
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
