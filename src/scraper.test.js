import { extractMetrics } from './scraper.js';

describe('extractMetrics', () => {
  test('extracts metrics from HTML', () => {
    const html = `
      <html>
        <head><title>Test Page</title><meta name="description" content="Test desc"></head>
        <body>
          <h1>Main Title</h1>
          <h2>Sub Title</h2>
          <button>Click Me</button>
          <a href="/contact" class="btn">Contact</a>
          <a href="https://external.com">External</a>
          <img src="img1.jpg" alt="Alt text">
          <img src="img2.jpg">
          <p>This is some text content.</p>
        </body>
      </html>
    `;
    const metrics = extractMetrics(html, 'https://example.com');

    expect(metrics.wordCount).toBeGreaterThan(0);
    expect(metrics.headings.h1).toBe(1);
    expect(metrics.headings.h2).toBe(1);
    expect(metrics.ctaCount).toBe(2); // button + .btn link
    expect(metrics.links.total).toBe(2);
    expect(metrics.links.internal).toBe(1);
    expect(metrics.links.external).toBe(1);
    expect(metrics.images.total).toBe(2);
    expect(metrics.images.missingAlt).toBe(1);
    expect(metrics.meta.title).toBe('Test Page');
    expect(metrics.meta.description).toBe('Test desc');
  });
});