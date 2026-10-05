import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp } from './support/test-app';

describe('Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns status and version', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    const body = res.body as { data: { status: string; version: string } };
    expect(body.data.status).toBe('ok');
    expect(typeof body.data.version).toBe('string');
  });

  it('unknown routes use the error envelope', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/nope')
      .expect(404);
    const body = res.body as { error: { code: string; message: string } };
    expect(body.error.code).toBe('NOT_FOUND');
  });
});
