import './support/http-env';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createSecureTestApp } from './support/secure-app';
import { API, as, errorCode, login } from './support/test-app';

/** security.md §6: helmet, CORS allow-list, size/page caps, DTO whitelist. */
describe('Security: HTTP hardening (e2e)', () => {
  let app: INestApplication<App>;
  let admin: string;
  let principal: string;

  beforeAll(async () => {
    app = await createSecureTestApp();
    admin = (await login(app, 'admin@eschool.local')).accessToken;
    principal = (await login(app, 'principal@eschool.local')).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows the web origin and ignores unknown origins (CORS)', async () => {
    const ok = await request(app.getHttpServer())
      .options(`${API}/auth/login`)
      .set('Origin', 'http://localhost:3001')
      .set('Access-Control-Request-Method', 'POST');
    expect(ok.headers['access-control-allow-origin']).toBe(
      'http://localhost:3001',
    );
    const evil = await request(app.getHttpServer())
      .options(`${API}/auth/login`)
      .set('Origin', 'https://evil.example')
      .set('Access-Control-Request-Method', 'POST');
    expect(evil.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('sends helmet headers and hides the framework', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['strict-transport-security']).toContain('max-age=');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['content-security-policy']).toContain(
      "frame-ancestors 'self'",
    );
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('rejects JSON bodies over the 100 kB limit with 413', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/auth/login`)
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ identifier: 'x'.repeat(200_000), password: 'x' }));
    expect(res.status).toBe(413);
    expect(errorCode(res)).toBe('PAYLOAD_TOO_LARGE');
  });

  it('caps pageSize at 100', async () => {
    const res = await as(app, principal).get('/students?pageSize=101');
    expect(res.status).toBe(400);
    expect(errorCode(res)).toBe('VALIDATION_FAILED');
  });

  it('rejects unknown body fields (mass assignment)', async () => {
    const me = await as(app, principal)
      .patch('/me', { tokenVersion: 0 })
      .expect(400);
    expect(errorCode(me)).toBe('VALIDATION_FAILED');

    const users = await as(app, admin).get('/users?pageSize=1').expect(200);
    const userId = (users.body as { data: { id: string }[] }).data[0].id;
    await as(app, admin)
      .patch(`/users/${userId}`, { status: 'ACTIVE', passwordHash: 'x' })
      .expect(400);

    const students = await as(app, principal)
      .get('/students?pageSize=1')
      .expect(200);
    const studentId = (students.body as { data: { id: string }[] }).data[0].id;
    const res = await as(app, principal)
      .patch(`/students/${studentId}`, { schoolId: userId })
      .expect(400);
    expect(errorCode(res)).toBe('VALIDATION_FAILED');
  });
});
