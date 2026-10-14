import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import { EmailChannel } from '../src/core/notifications/channels/email.channel';
import { SmsChannel } from '../src/core/notifications/channels/sms.channel';
import { PrismaService } from '../src/core/prisma/prisma.service';
import { as, createTestApp, errorCode, login } from './support/test-app';

const data = <T>(res: { body: unknown }) => (res.body as { data: T }).data;

/** Phase 6 §A: Settings › Support "Send test message". */
describe('Support test message (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens: Record<string, string> = {};
  const t = (who: string) => as(app, tokens[who]);

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    for (const who of ['admin', 'principal']) {
      tokens[who] = (await login(app, `${who}@eschool.local`)).accessToken;
    }
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    // Let fire-and-forget audit/notification writes finish before the pool closes.
    await new Promise((r) => setTimeout(r, 500));
    await app.close();
  });

  it('sends one SMS synchronously and audits a masked destination', async () => {
    const sms = jest.spyOn(app.get(SmsChannel), 'send');
    const res = await t('admin')
      .post('/support/test-message', { channel: 'SMS', to: '0300 9998877' })
      .expect(200);
    expect(data(res)).toEqual({ ok: true });
    expect(sms).toHaveBeenCalledWith(
      expect.objectContaining({ phone: '+923009998877' }),
    );
    const audit = await prisma.auditLog.findFirst({
      where: { action: 'support.test_message' },
      orderBy: { at: 'desc' },
    });
    expect(audit?.after).toMatchObject({
      channel: 'SMS',
      to: '+92*******877',
      driver: 'log',
      ok: true,
    });
  });

  it('returns provider failures instead of throwing', async () => {
    jest
      .spyOn(app.get(EmailChannel), 'send')
      .mockRejectedValueOnce(new Error('SMTP: 535 authentication failed'));
    const res = await t('admin')
      .post('/support/test-message', {
        channel: 'EMAIL',
        to: 'Admin@Example.com',
      })
      .expect(200);
    expect(data(res)).toEqual({
      ok: false,
      error: 'SMTP: 535 authentication failed',
    });
  });

  it('validates the destination and the channel', async () => {
    const bad = (body: object) =>
      t('admin').post('/support/test-message', body).expect(400);
    expect(errorCode(await bad({ channel: 'EMAIL', to: 'not-an-email' }))).toBe(
      'VALIDATION_FAILED',
    );
    await bad({ channel: 'SMS', to: 'phone?' });
    await bad({ channel: 'PUSH', to: 'x@y.z' });
  });

  it('is for super admins only', async () => {
    await t('principal')
      .post('/support/test-message', { channel: 'SMS', to: '03001234567' })
      .expect(403);
  });
});
