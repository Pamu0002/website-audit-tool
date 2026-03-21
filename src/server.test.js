import { jest } from '@jest/globals';
import request from 'supertest';

// Mock the scraper and ai modules
jest.mock('./scraper.js', () => ({
  fetchPage: jest.fn(),
  extractMetrics: jest.fn()
}));

jest.mock('./ai.js', () => ({
  aiAnalyze: jest.fn()
}));

import app from './server.js'; // Assuming we export app from server.js

const { fetchPage, extractMetrics, aiAnalyze } = await import('./scraper.js');
const { aiAnalyze: aiAnalyzeMock } = await import('./ai.js');

describe('POST /audit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns metrics and AI insights', async () => {
    const mockHtml = '<html><body>Test</body></html>';
    const mockMetrics = { wordCount: 1, headings: { h1: 0, h2: 0, h3: 0 }, ctaCount: 0, links: { total: 0, internal: 0, external: 0 }, images: { total: 0, missingAlt: 0, missingAltPercent: 0 }, meta: { title: '', description: '' }, sampleText: 'Test' };
    const mockAi = { prompt: 'test', rawResponse: '{"analysis":{"seo":"Good","messaging":"Clear","cta":"Present","depth":"Adequate","ux":"Good"},"recommendations":["Add more CTAs"],"warning":""}', ai: { analysis: { seo: 'Good', messaging: 'Clear', cta: 'Present', depth: 'Adequate', ux: 'Good' }, recommendations: ['Add more CTAs'] } };

    fetchPage.mockResolvedValue(mockHtml);
    extractMetrics.mockReturnValue(mockMetrics);
    aiAnalyzeMock.mockResolvedValue(mockAi);

    const response = await request(app)
      .post('/audit')
      .send({ url: 'https://example.com' })
      .expect(200);

    expect(response.body.metrics).toEqual(mockMetrics);
    expect(response.body.aiInsights).toEqual(mockAi);
  });

  test('validates URL', async () => {
    const response = await request(app)
      .post('/audit')
      .send({ url: 'invalid-url' })
      .expect(400);

    expect(response.body.error).toBe('Validation error');
  });
});