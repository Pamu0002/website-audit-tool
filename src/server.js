import dotenv from 'dotenv';
import express from 'express';
import { aiAnalyze } from './ai.js';
import { extractMetrics, fetchPage } from './scraper.js';

dotenv.config();

const app = express();
app.use(express.json());

app.post('/audit', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).send({ error: 'url is required' });

  try {
    const html = await fetchPage(url);
    const metrics = extractMetrics(html, url);
    const ai = await aiAnalyze(metrics);

    res.json({
      metrics,
      aiInsights: ai
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
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
