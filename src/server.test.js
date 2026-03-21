import request from 'supertest';
import { describe, expect, test } from 'vitest';
import app from './server.js';

describe('POST /audit validation', () => {
  test('rejects invalid URL format', async () => {
    const response = await request(app)
      .post('/audit')
      .send({ url: 'invalid-url' })
      .expect(400);

    expect(response.body.error).toBe('Validation error');
  });
});
