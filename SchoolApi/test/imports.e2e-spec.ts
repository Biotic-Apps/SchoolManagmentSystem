import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { schoolDate } from '../src/core/common/school-time';
import { PrismaService } from '../src/core/prisma/prisma.service';
import { API, as, createTestApp, errorCode, login } from './support/test-app';

const data = <T>(res: { body: unknown }) => (res.body as { data: T }).data;

interface Detail {
  id: string;
  status: string;
  totals: { rows: number; valid: number; invalid: number };
  errors: { row: number; column: string | null; message: string }[];
  preview: Record<string, unknown>[];
  reconciliation: Record<string, unknown> | null;
}

const STUDENT_HEADER =
  'Name,Gender,Date of birth,Class,Section,Roll no,Father/guardian name,Guardian phone';

describe('Data import (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens: Record<string, string> = {};
  const t = (who: string) => as(app, tokens[who]);
  let branchId: string;
  let sessionId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    for (const who of ['principal', 'accountant', 'teacher', 'parent']) {
      tokens[who] = (await login(app, `${who}@eschool.local`)).accessToken;
    }
    branchId = (
      await prisma.branch.findFirstOrThrow({ where: { code: 'MAIN' } })
    ).id;
    sessionId = (
      await prisma.academicSession.findFirstOrThrow({
        where: { branchId, status: 'ACTIVE' },
      })
    ).id;
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 500));
    await app.close();
  });

  function upload(kind: string, csv: string, name = 'data.csv') {
    return request(app.getHttpServer())
      .post(`${API}/imports`)
      .set('Authorization', `Bearer ${tokens.principal}`)
      .field('kind', kind)
      .field('branchId', branchId)
      .field('sessionId', sessionId)
      .attach('file', Buffer.from(`\uFEFF${csv}\r\n`, 'utf8'), name);
  }

  async function validated(csv: string, kind = 'STUDENTS'): Promise<Detail> {
    const res = await upload(kind, csv).expect(201);
    const id = data<{ importId: string }>(res).importId;
    for (let i = 0; i < 100; i++) {
      const detail = data<Detail>(
        await t('principal').get(`/imports/${id}`).expect(200),
      );
      if (detail.status !== 'VALIDATING') return detail;
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error('validation did not finish');
  }

  it('denies parents and teachers', async () => {
    for (const who of ['parent', 'teacher']) {
      const res = await t(who).get('/imports/templates/STUDENTS').expect(403);
      expect(errorCode(res)).toBe('FORBIDDEN');
      await t(who).get(`/imports?branchId=${branchId}`).expect(403);
    }
  });

  it('serves an XLSX template', async () => {
    const res = await request(app.getHttpServer())
      .get(`${API}/imports/templates/STUDENTS`)
      .set('Authorization', `Bearer ${tokens.principal}`)
      .buffer(true)
      .parse((r, cb) => {
        const chunks: Buffer[] = [];
        r.on('data', (c: Buffer) => chunks.push(c));
        r.on('end', () => cb(null, Buffer.concat(chunks)));
      })
      .expect(200);
    expect(res.headers['content-disposition']).toMatch(/attachment/);
    expect((res.body as Buffer).subarray(0, 4)).toEqual(
      Buffer.from([0x50, 0x4b, 0x03, 0x04]),
    );
  });

  it('rejects files that are not xlsx/csv', async () => {
    await upload('STUDENTS', 'x', 'evil.exe').expect(400);
    const fake = await request(app.getHttpServer())
      .post(`${API}/imports`)
      .set('Authorization', `Bearer ${tokens.principal}`)
      .field('kind', 'STUDENTS')
      .field('branchId', branchId)
      .field('sessionId', sessionId)
      .attach('file', Buffer.from('not a zip'), 'fake.xlsx');
    expect(fake.status).toBe(400);
  });

  it('validates, refuses, commits with skipInvalid and reverts students', async () => {
    const detail = await validated(
      [
        STUDENT_HEADER,
        'Kamran Akmal,M,2019-01-05,Class 2,A,,Akmal Khan,03215550001',
        'زینب فاطمہ,F,05/02/2019,2,A,,فاطمہ بی بی,03215550002',
        'Bad Phone,M,2019-03-03,Class 2,A,,Some One,0300-12',
      ].join('\r\n'),
    );
    expect(detail.status).toBe('INVALID');
    expect(detail.totals).toEqual({ rows: 3, valid: 2, invalid: 1 });
    expect(detail.errors).toEqual([
      expect.objectContaining({ row: 4, column: 'Guardian phone' }),
    ]);
    const blocked = await t('principal')
      .post(`/imports/${detail.id}/commit`, {})
      .expect(409);
    expect(errorCode(blocked)).toBe('CONFLICT');
    await t('teacher')
      .post(`/imports/${detail.id}/commit`, { skipInvalid: true })
      .expect(403);

    const done = data<Detail>(
      await t('principal')
        .post(`/imports/${detail.id}/commit`, { skipInvalid: true })
        .expect(200),
    );
    expect(done.status).toBe('COMMITTED');
    expect(done.reconciliation).toMatchObject({ created: 2, skipped: 1 });
    const urdu = await prisma.student.findFirstOrThrow({
      where: { firstName: 'زینب', lastName: 'فاطمہ' },
      include: {
        enrollments: true,
        guardianLinks: { include: { guardian: true } },
      },
    });
    expect(urdu.enrollments[0]).toMatchObject({ status: 'ACTIVE', sessionId });
    expect(urdu.guardianLinks[0].guardian).toMatchObject({
      name: 'فاطمہ بی بی',
      phone: '+923215550002',
    });
    await t('principal')
      .post(`/imports/${detail.id}/commit`, { skipInvalid: true })
      .expect(409);

    const history = data<{ id: string }[]>(
      await t('principal').get(`/imports?branchId=${branchId}`).expect(200),
    );
    expect(history.map((h) => h.id)).toContain(detail.id);

    const reverted = data<Detail>(
      await t('principal').post(`/imports/${detail.id}/revert`).expect(200),
    );
    expect(reverted.status).toBe('REVERTED');
    expect(await prisma.student.count({ where: { id: urdu.id } })).toBe(0);
    expect(
      await prisma.guardian.count({ where: { phone: '+923215550002' } }),
    ).toBe(0);
  });

  it('refuses to revert in-use records; imports opening balances', async () => {
    const students = await validated(
      [
        STUDENT_HEADER,
        'Nadia Hussain,F,2018-06-01,Class 3,A,,,',
        'Omar Farooq,M,2018-07-01,Class 3,A,,,',
      ].join('\r\n'),
    );
    expect(students.status).toBe('READY');
    await t('principal').post(`/imports/${students.id}/commit`, {}).expect(200);
    const [nadia, omar] = await Promise.all(
      ['Nadia', 'Omar'].map((firstName) =>
        prisma.student.findFirstOrThrow({
          where: { firstName, enrollments: { some: { sessionId } } },
        }),
      ),
    );
    // Nadia pays in advance (advance credit, referenced by a payment).
    await t('accountant')
      .post('/payments', {
        studentId: nadia.id,
        amountMinor: 30000,
        method: 'BANK',
        reference: 'IMPORT-E2E',
        receivedOn: schoolDate(),
      })
      .expect(201);
    const blocked = await t('principal')
      .post(`/imports/${students.id}/revert`)
      .expect(409);
    expect(JSON.stringify(blocked.body)).toMatch(/payments/);

    const before = await prisma.ledgerEntry.aggregate({
      where: { studentId: omar.id },
      _sum: { amountMinor: true },
    });
    const opening = await validated(
      [
        'Admission no,Amount,As of date',
        `${nadia.admissionNo},"1,000.00",31/03/2026`,
        `${omar.admissionNo},250.50,2026-03-31`,
      ].join('\r\n'),
      'OPENING_BALANCES',
    );
    expect(opening.status).toBe('READY');
    const done = data<Detail>(
      await t('principal')
        .post(`/imports/${opening.id}/commit`, {})
        .expect(200),
    );
    expect(done.reconciliation).toMatchObject({
      fileTotalMinor: 125050,
      importedTotalMinor: 125050,
      students: 2,
      matches: true,
      advanceAppliedMinor: 30000,
    });
    const after = await prisma.ledgerEntry.aggregate({
      where: { studentId: omar.id },
      _sum: { amountMinor: true },
    });
    expect(
      Number(after._sum.amountMinor ?? 0n) -
        Number(before._sum.amountMinor ?? 0n),
    ).toBe(25050);
    const charge = await prisma.ledgerEntry.findFirstOrThrow({
      where: { studentId: omar.id, refType: 'OPENING_BALANCE' },
    });
    expect(charge).toMatchObject({ type: 'CHARGE' });
    const invoice = await prisma.invoice.findFirstOrThrow({
      where: { studentId: nadia.id, source: 'OPENING' },
    });
    expect(Number(invoice.paidMinor)).toBe(30000);

    // Opening invoice with money on it cannot be reverted; duplicate import is invalid.
    await t('principal').post(`/imports/${opening.id}/revert`).expect(409);
    const again = await validated(
      [
        'Admission no,Amount,As of date',
        `${omar.admissionNo},10,2026-03-31`,
      ].join('\r\n'),
      'OPENING_BALANCES',
    );
    expect(again.errors[0].message).toMatch(/already has an opening balance/);
  });
});
