import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { PrismaService } from '../src/core/prisma/prisma.service';
import { API, as, createTestApp, errorCode, login } from './support/test-app';

const data = <T>(res: { body: unknown }) => (res.body as { data: T }).data;

/** Phase 5 §A settings/branding and §C Settings › Support. */
describe('Settings and support (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens: Record<string, string> = {};
  const t = (who: string) => as(app, tokens[who]);
  let schoolId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    for (const who of ['admin', 'principal', 'teacher']) {
      tokens[who] = (await login(app, `${who}@eschool.local`)).accessToken;
    }
    schoolId = (
      await prisma.school.findFirstOrThrow({ where: { code: 'BRIGHT' } })
    ).id;
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 300));
    await app.close();
  });

  it('serves public branding with only the five display fields', async () => {
    const res = await request(app.getHttpServer())
      .get(`${API}/branding`)
      .expect(200);
    const body = data<Record<string, unknown>>(res);
    expect(Object.keys(body).sort()).toEqual([
      'accentSoftColor',
      'appName',
      'logoUrl',
      'primaryColor',
      'schoolName',
    ]);
    expect(body.schoolName).toBe('Bright School');
    await request(app.getHttpServer())
      .get(`${API}/branding?schoolId=00000000-0000-4000-8000-000000000000`)
      .expect(404);
    await t('teacher').get(`/branding?schoolId=${schoolId}`).expect(200);
  });

  it('lets the principal read but not change school settings', async () => {
    const res = await t('principal')
      .get(`/settings/school/${schoolId}`)
      .expect(200);
    expect(data<{ primaryColor: string }>(res).primaryColor).toBe('#0B7F74');
    await t('principal')
      .get(`/settings/policies?schoolId=${schoolId}`)
      .expect(200);
    const denied = await t('principal')
      .patch(`/settings/school/${schoolId}`, { appName: 'Nope' })
      .expect(403);
    expect(errorCode(denied)).toBe('FORBIDDEN');
    await t('teacher').get(`/settings/school/${schoolId}`).expect(403);
    await t('admin')
      .get('/settings/school/00000000-0000-4000-8000-000000000000')
      .expect(404);
  });

  it('enforces primary colour contrast and reflects it in branding', async () => {
    const bad = await t('admin')
      .patch(`/settings/school/${schoolId}`, { primaryColor: '#FFFF00' })
      .expect(400);
    expect(errorCode(bad)).toBe('VALIDATION_FAILED');
    expect(JSON.stringify(bad.body)).toContain('1.07:1');

    await t('admin')
      .patch(`/settings/school/${schoolId}`, { primaryColor: '#1f4e79' })
      .expect(200);
    const branding = await request(app.getHttpServer())
      .get(`${API}/branding?schoolId=${schoolId}`)
      .expect(200);
    expect(data<{ primaryColor: string }>(branding).primaryColor).toBe(
      '#1F4E79',
    );
    const audit = await prisma.auditLog.count({
      where: { action: 'settings.school.update', entityId: schoolId },
    });
    expect(audit).toBeGreaterThan(0);

    await t('admin')
      .patch(`/settings/school/${schoolId}`, { primaryColor: '#0B7F74' })
      .expect(200);
  });

  it('validates and merges policies and notification settings', async () => {
    await t('admin')
      .patch(`/settings/policies?schoolId=${schoolId}`, {
        sessionTimeoutMinutes: 2,
      })
      .expect(400);
    await t('admin')
      .patch(`/settings/policies?schoolId=${schoolId}`, {
        approvalLimits: { SALARY: 5 },
      })
      .expect(400);
    const ok = await t('admin')
      .patch(`/settings/policies?schoolId=${schoolId}`, {
        sessionTimeoutMinutes: 45,
      })
      .expect(200);
    const policies = data<{
      sessionTimeoutMinutes: number;
      attendanceLockTime: string;
    }>(ok);
    expect(policies.sessionTimeoutMinutes).toBe(45);
    expect(policies.attendanceLockTime).toBe('11:00');
    await t('admin')
      .patch(`/settings/policies?schoolId=${schoolId}`, {
        sessionTimeoutMinutes: 30,
      })
      .expect(200);

    const res = await t('admin')
      .get(`/settings/notifications?schoolId=${schoolId}`)
      .expect(200);
    const settings = data<{ categories: { category: string }[] }>(res);
    expect(settings.categories.map((c) => c.category)).toContain('HEALTH');
    await t('admin')
      .patch(`/settings/notifications?schoolId=${schoolId}`, {
        categories: [
          { category: 'NOPE', email: true, sms: true, push: true, inApp: true },
        ],
      })
      .expect(400);
  });

  it('lists a failed delivery and resends it to the current address', async () => {
    const user = await prisma.user.findFirstOrThrow({
      where: { email: 'teacher@eschool.local' },
    });
    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        category: 'NOTICE',
        title: 'E2E failed delivery',
        body: 'body',
        deliveries: {
          create: [
            { channel: 'IN_APP', status: 'SENT', attempts: 1 },
            {
              channel: 'EMAIL',
              status: 'FAILED',
              attempts: 1,
              lastError: 'smtp down',
            },
          ],
        },
      },
      include: { deliveries: true },
    });
    const delivery = notification.deliveries.find(
      (d) => d.channel === 'EMAIL',
    )!;

    const list = await t('admin')
      .get(`/support/notifications/failed?schoolId=${schoolId}&channel=EMAIL`)
      .expect(200);
    const row = data<{ id: string; recipient: { contact: string } }[]>(
      list,
    ).find((r) => r.id === delivery.id);
    expect(row?.recipient.contact).toBe('t******@eschool.local');

    const resent = await t('admin')
      .post(`/support/notifications/failed/${delivery.id}/resend`)
      .expect(200);
    expect(data<{ status: string; attempts: number }>(resent)).toMatchObject({
      status: 'SENT',
      attempts: 2,
    });
    await t('admin')
      .post(`/support/notifications/failed/${delivery.id}/resend`)
      .expect(409);
  });

  it('keeps Settings › Support away from teachers and principals', async () => {
    for (const who of ['teacher', 'principal']) {
      await t(who).get('/support/jobs').expect(403);
      await t(who).get('/support/notifications/failed').expect(403);
      await t(who).get('/support/health').expect(403);
    }
  });

  it('refuses to retry a job run that did not fail', async () => {
    const run = await prisma.jobRun.create({
      data: {
        queue: 'notifications',
        name: 'notifications.send',
        driver: 'inline',
        status: 'COMPLETED',
        data: { userIds: [] },
        finishedAt: new Date(),
      },
    });
    const list = await t('admin').get('/support/jobs?status=DONE').expect(200);
    const rows = data<Record<string, unknown>[]>(list);
    expect(rows.some((r) => r.id === run.id)).toBe(true);
    expect(rows.every((r) => !('data' in r))).toBe(true);
    await t('admin').post(`/support/jobs/${run.id}/retry`).expect(409);
  });

  it('retries a failed run once', async () => {
    const run = await prisma.jobRun.create({
      data: {
        queue: 'notifications',
        name: 'notifications.send',
        driver: 'inline',
        status: 'FAILED',
        error: 'boom',
        data: { userIds: [], category: 'NOTICE', title: 'x', body: 'y' },
        finishedAt: new Date(),
      },
    });
    const res = await t('admin')
      .post(`/support/jobs/${run.id}/retry`)
      .expect(200);
    expect(data<{ retriedAt: string | null }>(res).retriedAt).not.toBeNull();
    await t('admin').post(`/support/jobs/${run.id}/retry`).expect(409);
  });

  it('reports system health to the super admin', async () => {
    const res = await t('admin').get('/support/health').expect(200);
    const health = data<{
      db: string;
      queue: { driver: string };
      storage: { ok: boolean };
    }>(res);
    expect(health.db).toBe('ok');
    expect(health.queue.driver).toBe('inline');
    expect(health.storage.ok).toBe(true);
    const audited = await prisma.auditLog.count({
      where: { action: 'support.health_read' },
    });
    expect(audited).toBeGreaterThan(0);
  });
});
