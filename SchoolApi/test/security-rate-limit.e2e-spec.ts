import './support/trusted-proxy-env';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { listRoutes } from './support/route-inventory';
import { API, createTestApp, errorCode } from './support/test-app';

/** Routes that must carry @AuthThrottle (credential / code guessing). */
const AUTH_THROTTLED = [
  'GET /certificates/verify/:serial',
  'POST /auth/2fa/disable',
  'POST /auth/2fa/enable',
  'POST /auth/2fa/recovery-codes/regenerate',
  'POST /auth/2fa/verify',
  'POST /auth/login',
  'POST /auth/otp/request',
  'POST /auth/otp/verify',
  'POST /auth/password/forgot',
  'POST /auth/password/reset',
  'POST /auth/refresh',
  'POST /child-links/:id/otp',
  'POST /child-links/request',
  'POST /support/test-message',
];

describe('Security: rate limits behind a trusted proxy (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  const badLogin = (clientIp: string) =>
    request(app.getHttpServer())
      .post(`${API}/auth/login`)
      .set('X-Forwarded-For', clientIp)
      .send({
        identifier: 'nobody@eschool.local',
        password: 'Wrong@1234',
        platform: 'WEB',
        deviceName: 'e2e',
      });

  it('4th login within the window from one client → 429 RATE_LIMITED', async () => {
    for (let i = 0; i < 3; i++) {
      await badLogin('203.0.113.10').expect(401);
    }
    const res = await badLogin('203.0.113.10').expect(429);
    expect(errorCode(res)).toBe('RATE_LIMITED');
  });

  it('clients forwarded by the trusted proxy get separate budgets', async () => {
    for (let i = 0; i < 3; i++) {
      await badLogin('203.0.113.20').expect(401);
    }
    await badLogin('203.0.113.20').expect(429);
    // Same proxy (loopback), different real client: not throttled.
    await badLogin('203.0.113.21').expect(401);
  });

  it('uses the right-most untrusted X-Forwarded-For entry (no spoofing)', async () => {
    // A client-supplied left-most entry must not create a fresh budget.
    for (let i = 0; i < 3; i++) {
      await badLogin(`198.51.100.${i}, 203.0.113.30`).expect(401);
    }
    const res = await badLogin('198.51.100.99, 203.0.113.30').expect(429);
    expect(errorCode(res)).toBe('RATE_LIMITED');
  });

  it('credential endpoints carry @AuthThrottle', () => {
    const throttled = listRoutes(app)
      .filter((route) => route.authThrottle)
      .map((route) => route.key);
    for (const key of AUTH_THROTTLED) expect(throttled).toContain(key);
  });
});
