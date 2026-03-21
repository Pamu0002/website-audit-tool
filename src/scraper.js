import axios from 'axios';
import { load } from 'cheerio';
import https from 'https';
import { URL } from 'url';

export async function fetchPage(url) {
  try {
    const response = await axios.get(url, {
      timeout: 30000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      httpsAgent: new https.Agent({ rejectUnauthorized: false, keepAlive: false }),
      maxRedirects: 5
    });
    return response.data;
  } catch (error) {
    const errorMsg = error?.message || 'Fetch failed';
    const cause = error?.cause || error?.toJSON?.() || error;
    throw new Error(`FetchPage error: ${errorMsg} - ${JSON.stringify(cause)}`);
  }
}

export function extractMetrics(html, pageUrl) {
  const $ = load(html);
  const bodyText = $('body').text();
  const words = bodyText.match(/\w+/g) || [];

  const headings = {
    h1: $('h1').length,
    h2: $('h2').length,
    h3: $('h3').length
  };

  const buttonCount = $('button').length;
  const ctaLinkCount = $('a').filter((i, el) => {
    const className = ($(el).attr('class') || '').toLowerCase();
    return /btn|cta|primary|action/.test(className);
  }).length;

  const totalCTAs = buttonCount + ctaLinkCount;

  const allLinks = $('a[href]').toArray().map(el => {
    const href = $(el).attr('href');
    try {
      return new URL(href, pageUrl);
    } catch {
      return null;
    }
  }).filter(Boolean);

  const host = new URL(pageUrl).hostname;
  const internalLinks = allLinks.filter(u => u.hostname === host).length;
  const externalLinks = allLinks.length - internalLinks;

  const images = $('img').toArray();
  const missingAlt = images.filter(img => {
    const altText = $(img).attr('alt') || '';
    return !altText.trim();
  }).length;

  const title = $('head title').text().trim();
  const description = $('meta[name="description"]').attr('content') || '';

  return {
    url: pageUrl,
    wordCount: words.length,
    headings,
    ctaCount: totalCTAs,
    links: {
      total: allLinks.length,
      internal: internalLinks,
      external: externalLinks
    },
    images: {
      total: images.length,
      missingAlt,
      missingAltPercent: images.length ? Number((missingAlt * 100 / images.length).toFixed(1)) : 0
    },
    meta: {
      title,
      description
    },
    sampleText: bodyText.slice(0, 12000)
  };
}
