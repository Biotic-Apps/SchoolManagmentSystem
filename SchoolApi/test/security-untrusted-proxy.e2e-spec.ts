import './support/untrusted-proxy-env';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { API, createTestApp, errorCode } from './support/test-app';

/**
 * TRUSTED_PROXIES lists only 10.9.9.9, so supertest (loopback) is a direct
 * client: a spoofed X-Forwarded-For must not buy a fresh rate-limit budget.
 */
describe('Security: spoofed X-Forwarded-For from an untrusted peer (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('shares one budget whatever X-Forwarded-For says', async () => {
    const attempt = (spoofed: string) =>
      request(app.getHttpServer())
        .post(`${API}/auth/login`)
        .set('X-Forwarded-For', spoofed)
        .send({
          identifier: 'nobody@eschool.local',
          password: 'Wrong@1234',
          platform: 'WEB',
          deviceName: 'e2e',
        });
    for (let i = 0; i < 3; i++) await attempt(`203.0.113.${i}`).expect(401);
    const res = await attempt('203.0.113.200').expect(429);
    expect(errorCode(res)).toBe('RATE_LIMITED');
  });
});
