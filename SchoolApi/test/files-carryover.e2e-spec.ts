import type { INestApplication } from '@nestjs/common';
import sharp from 'sharp';
import request from 'supertest';
import type { App } from 'supertest/types';
import { PrismaService } from '../src/core/prisma/prisma.service';
import {
  API,
  as,
  createTestApp,
  errorCode,
  login,
  unique,
} from './support/test-app';

const data = <T>(res: { body: unknown }) => (res.body as { data: T }).data;

interface Uploaded {
  id: string;
  url: string;
  mime: string;
  size: number;
}

interface Adjustment {
  id: string;
  status: string;
  cancelReason: string | null;
  cancelledAt: string | null;
  cancelledBy: { id: string; name: string } | null;
}

/** Path + query of an absolute signed URL (served by the test app). */
const pathOf = (url: string) => {
  const parsed = new URL(url);
  return parsed.pathname + parsed.search;
};

/** Phase 5 §F (files) + carry-overs: adjustment cancel, fee plan archive. */
describe('Files & Phase 4 carry-overs (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens: Record<string, string> = {};
  const t = (who: string) => as(app, tokens[who]);

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    for (const who of ['principal', 'accountant', 'teacher', 'parent']) {
      tokens[who] = (await login(app, `${who}@eschool.local`)).accessToken;
    }
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 500));
    await app.close();
  });

  const upload = (who: string, purpose: string, file: Buffer, name: string) =>
    request(app.getHttpServer())
      .post(`${API}/files`)
      .set('Authorization', `Bearer ${tokens[who]}`)
      .field('purpose', purpose)
      .attach('file', file, name);

  const fetchContent = (url: string) =>
    request(app.getHttpServer())
      .get(pathOf(url))
      .buffer(true)
      .parse((res, done) => {
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => done(null, Buffer.concat(chunks)));
      });

  describe('uploads', () => {
    it('re-encodes photos: EXIF stripped, orientation applied, ≤ 2048 px', async () => {
      const jpeg = await sharp({
        create: { width: 3000, height: 1200, channels: 3, background: '#335' },
      })
        .jpeg()
        .withExif({ IFD0: { Make: 'SpyCam', Model: 'GPS-1' } })
        .withMetadata({ orientation: 6 })
        .toBuffer();
      expect((await sharp(jpeg).metadata()).exif).toBeDefined();

      const res = await upload('principal', 'STUDENT_PHOTO', jpeg, 'kid.jpeg');
      expect(res.status).toBe(201);
      const file = data<Uploaded>(res);
      expect(file.mime).toBe('image/jpeg');

      const stored = await prisma.file.findUniqueOrThrow({
        where: { id: file.id },
      });
      expect(stored.size).toBe(file.size);
      expect(stored.originalName).toBe('kid.jpg');
      expect(stored.scanStatus).toBe('PENDING'); // no CLAMAV_HOST in tests

      const content = await fetchContent(file.url).expect(200);
      const body = content.body as Buffer;
      expect(body.length).toBe(stored.size);
      const meta = await sharp(body).metadata();
      expect(meta.exif).toBeUndefined();
      expect(meta.orientation).toBeUndefined();
      expect(Math.max(meta.width, meta.height)).toBe(2048);
      expect(meta.height).toBeGreaterThan(meta.width); // rotated portrait
    });

    it('rejects undecodable images and IMPORT uploads', async () => {
      const fake = Buffer.concat([
        Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
        Buffer.alloc(200, 3),
      ]);
      const bad = await upload('principal', 'STUDENT_PHOTO', fake, 'x.jpg');
      expect(bad.status).toBe(400);
      const pdf = Buffer.from('%PDF-1.4\n%%EOF\n');
      const imp = await upload('principal', 'IMPORT', pdf, 'x.pdf');
      expect(imp.status).toBe(400);
    });
  });

  describe('GET /files/:id/url authorization and scan status', () => {
    let doc: Uploaded;

    beforeAll(async () => {
      const pdf = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\n%%EOF\n');
      doc = data<Uploaded>(
        await upload('principal', 'DOCUMENT', pdf, 'b-form.pdf').expect(201),
      );
    });

    it('hides a principal DOCUMENT from parent and teacher (404)', async () => {
      for (const who of ['parent', 'teacher']) {
        const res = await t(who).get(`/files/${doc.id}/url`);
        expect(res.status).toBe(404);
      }
    });

    it('serves it to the uploader and school management', async () => {
      await t('principal').get(`/files/${doc.id}/url`).expect(200);
      const res = await t('accountant').get(`/files/${doc.id}/url`);
      // Accountant is branch-scoped management of the same school.
      expect(res.status).toBe(200);
    });

    it('never serves INFECTED files (410)', async () => {
      const signed = data<{ url: string }>(
        await t('principal').get(`/files/${doc.id}/url`).expect(200),
      );
      await prisma.file.update({
        where: { id: doc.id },
        data: { scanStatus: 'INFECTED' },
      });
      const url = await t('principal').get(`/files/${doc.id}/url`);
      expect(url.status).toBe(410);
      expect(errorCode(url)).toBe('FILE_UNAVAILABLE');
      const content = await request(app.getHttpServer()).get(
        pathOf(signed.url),
      );
      expect(content.status).toBe(410);
    });
  });

  describe('payroll adjustment cancel', () => {
    it('cancels a pending adjustment with a reason, once', async () => {
      const staff = await prisma.staff.findFirstOrThrow({
        where: { user: { email: 'teacher@eschool.local' } },
      });
      const future = new Date();
      future.setUTCMonth(future.getUTCMonth() + 3);
      const month = future.toISOString().slice(0, 7);
      const created = data<Adjustment>(
        await t('accountant')
          .post('/payroll/adjustments', {
            staffId: staff.id,
            month,
            kind: 'BONUS',
            amountMinor: 150000,
            reason: 'Exam duty',
          })
          .expect(201),
      );
      expect(created.cancelledBy).toBeNull();

      const noReason = await t('accountant').post(
        `/payroll/adjustments/${created.id}/cancel`,
        {},
      );
      expect(noReason.status).toBe(400);
      const parent = await t('parent').post(
        `/payroll/adjustments/${created.id}/cancel`,
        { reason: 'nope' },
      );
      expect(parent.status).toBe(403);

      const cancelled = data<Adjustment>(
        await t('accountant')
          .post(`/payroll/adjustments/${created.id}/cancel`, {
            reason: 'Entered twice',
          })
          .expect(200),
      );
      expect(cancelled.status).toBe('CANCELLED');
      expect(cancelled.cancelReason).toBe('Entered twice');
      expect(cancelled.cancelledAt).not.toBeNull();
      expect(cancelled.cancelledBy?.name).toBeTruthy();

      const list = data<Adjustment[]>(
        await t('accountant')
          .get(`/payroll/adjustments?staffId=${staff.id}&month=${month}`)
          .expect(200),
      );
      expect(list.find((a) => a.id === created.id)?.status).toBe('CANCELLED');

      const again = await t('accountant').post(
        `/payroll/adjustments/${created.id}/cancel`,
        { reason: 'Entered twice' },
      );
      expect(again.status).toBe(409);
    });
  });

  describe('fee plan archive', () => {
    it('archives a plan: hidden by default, approve → 409', async () => {
      const seeded = await prisma.feePlan.findFirstOrThrow({
        where: { status: 'APPROVED' },
        include: { items: true },
      });
      const plan = data<{ id: string; status: string }>(
        await t('accountant')
          .post('/fee-plans', {
            branchId: seeded.branchId,
            sessionId: seeded.sessionId,
            classId: seeded.classId,
            name: unique('Archive '),
            items: seeded.items.map((i) => ({
              feeHeadId: i.feeHeadId,
              amountMinor: 1000,
              frequency: i.frequency,
              dueDay: i.dueDay,
            })),
            lateFee: null,
          })
          .expect(201),
      );
      const query = `branchId=${seeded.branchId}&sessionId=${seeded.sessionId}`;

      const archived = data<{ status: string }>(
        await t('accountant')
          .post(`/fee-plans/${plan.id}/archive`, { reason: 'Duplicate' })
          .expect(200),
      );
      expect(archived.status).toBe('ARCHIVED');

      const ids = (path: string) =>
        t('accountant')
          .get(path)
          .expect(200)
          .then((res) => data<{ id: string }[]>(res).map((p) => p.id));
      expect(await ids(`/fee-plans?${query}`)).not.toContain(plan.id);
      expect(await ids(`/fee-plans?${query}&includeArchived=true`)).toContain(
        plan.id,
      );
      expect(await ids(`/fee-plans?${query}&status=ARCHIVED`)).toContain(
        plan.id,
      );

      const approve = await t('principal').post(
        `/fee-plans/${plan.id}/approve`,
      );
      expect(approve.status).toBe(409);
      const patch = await t('accountant').patch(`/fee-plans/${plan.id}`, {
        name: unique('Again '),
      });
      expect(patch.status).toBe(409);
      const twice = await t('accountant').post(`/fee-plans/${plan.id}/archive`);
      expect(twice.status).toBe(409);

      const audit = await prisma.auditLog.findFirst({
        where: { action: 'fee_plan.archive', entityId: plan.id },
      });
      expect(audit).not.toBeNull();
    });
  });
});
