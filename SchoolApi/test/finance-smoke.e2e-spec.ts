import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import { PrismaService } from '../src/core/prisma/prisma.service';
import { as, createTestApp, errorCode, login } from './support/test-app';

const data = <T>(res: { body: unknown }) => (res.body as { data: T }).data;

interface Job {
  status: string;
  error?: string;
  result?: { fileUrl?: string | null; count?: number };
}

/** Broad Phase 4 read + job coverage against the seeded demo data. */
describe('Phase 4 smoke (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens: Record<string, string> = {};
  const t = (who: string) => as(app, tokens[who]);
  let branchId: string;
  let schoolId: string;
  let sessionId: string;
  const month = new Date().toISOString().slice(0, 7);

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    for (const who of [
      'principal',
      'accountant',
      'teacher',
      'parent',
      'admin',
    ]) {
      tokens[who] = (await login(app, `${who}@eschool.local`)).accessToken;
    }
    const branch = await prisma.branch.findFirstOrThrow({
      where: { code: 'MAIN' },
    });
    branchId = branch.id;
    schoolId = branch.schoolId;
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

  async function waitJob(who: string, jobId: string): Promise<Job> {
    for (let i = 0; i < 150; i++) {
      const job = data<Job>(await t(who).get(`/jobs/${jobId}`).expect(200));
      if (job.status === 'DONE' || job.status === 'FAILED') return job;
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error('job did not finish');
  }

  it('serves the Phase 4 lists to the accountant and principal', async () => {
    const paths = [
      `/fee-heads?schoolId=${schoolId}`,
      `/fee-plans?branchId=${branchId}&sessionId=${sessionId}`,
      `/invoices?branchId=${branchId}`,
      `/payments?branchId=${branchId}`,
      `/payment-proofs?branchId=${branchId}`,
      `/concessions`,
      `/refunds?branchId=${branchId}`,
      `/dues?branchId=${branchId}`,
      `/collections/daily?branchId=${branchId}`,
      `/dashboard/finance?branchId=${branchId}&month=${month}`,
      `/payroll/runs?branchId=${branchId}`,
      `/payroll/adjustments?branchId=${branchId}`,
      `/vendors`,
      `/expense-categories?schoolId=${schoolId}`,
      `/expenses?branchId=${branchId}`,
      `/inventory/items?branchId=${branchId}`,
      `/inventory/stock?branchId=${branchId}`,
      `/inventory/movements?branchId=${branchId}`,
      `/assets?branchId=${branchId}`,
      `/purchase-requests?branchId=${branchId}`,
      `/purchase-orders?branchId=${branchId}`,
      `/certificates?branchId=${branchId}`,
      `/reports/catalog`,
    ];
    for (const who of ['accountant', 'principal']) {
      for (const path of paths) {
        const res = await t(who).get(path);
        if (res.status !== 200)
          throw new Error(
            `${who} GET ${path} → ${res.status} ${JSON.stringify(res.body)}`,
          );
      }
    }
    for (const path of [
      `/grading-schemes?schoolId=${schoolId}&sessionId=${sessionId}`,
      `/exams?branchId=${branchId}`,
      `/promotions?branchId=${branchId}&fromSessionId=${sessionId}`,
    ]) {
      const res = await t('principal').get(path);
      if (res.status !== 200)
        throw new Error(
          `GET ${path} → ${res.status} ${JSON.stringify(res.body)}`,
        );
    }
  });

  it('shows a parent their fee summary, invoices, ledger and payslip-free views', async () => {
    const me = data<{ children: { id: string }[] }>(
      await t('parent').get('/me'),
    );
    const child = me.children[0].id;
    const summary = data<{
      proofUploadEnabled: boolean;
      onlineGatewayEnabled: boolean;
    }>(await t('parent').get(`/students/${child}/fee-summary`).expect(200));
    expect(summary.proofUploadEnabled).toBe(true);
    expect(summary.onlineGatewayEnabled).toBe(false);
    await t('parent').get(`/students/${child}/ledger`).expect(200);
    await t('parent').get('/invoices').expect(200);
    await t('parent').get(`/students/${child}/report-cards`).expect(200);
    const invoice = await prisma.invoice.findFirstOrThrow({
      where: { studentId: child },
    });
    const res = await t('parent').post('/payments/online/initiate', {
      invoiceId: invoice.id,
    });
    expect([409]).toContain(res.status);
    await t('parent').get('/payroll/runs').expect(403);
  });

  it('renders challans, receipts, payslips and certificates', async () => {
    const invoice = await prisma.invoice.findFirstOrThrow({
      where: { branchId, status: 'PAID' },
    });
    const challan = data<{ jobId: string }>(
      await t('accountant').get(`/invoices/${invoice.id}/pdf`).expect(200),
    );
    expect((await waitJob('accountant', challan.jobId)).status).toBe('DONE');
    const payment = await prisma.payment.findFirstOrThrow({
      where: { branchId },
    });
    const receipt = data<{ jobId: string }>(
      await t('accountant').get(`/payments/${payment.id}/receipt`).expect(200),
    );
    expect((await waitJob('accountant', receipt.jobId)).status).toBe('DONE');
    const last = new Date();
    last.setUTCDate(1);
    last.setUTCMonth(last.getUTCMonth() - 1);
    await t('teacher')
      .get(`/payslips/me?month=${last.toISOString().slice(0, 7)}`)
      .expect(200);
    const cert = await prisma.certificate.findFirstOrThrow({
      where: { status: 'ISSUED' },
    });
    await t('principal').get(`/certificates/${cert.id}`).expect(200);
  });

  it('runs payroll calculation and report jobs', async () => {
    const run = await prisma.payrollRun.findFirstOrThrow({
      where: { branchId, month },
    });
    const calc = data<{ jobId: string }>(
      await t('accountant')
        .post(`/payroll/runs/${run.id}/calculate`)
        .expect(200),
    );
    const job = await waitJob('accountant', calc.jobId);
    expect(job.error ?? job.status).toBe('DONE');
    for (const [key, params] of [
      ['fees.aging', { branchId }],
      ['inventory.stock', { branchId }],
      ['payroll.summary', { branchId, month }],
    ] as const) {
      for (const format of ['CSV', 'XLSX', 'PDF']) {
        const res = await t('accountant')
          .post('/reports', { key, params, format })
          .expect(201);
        const done = await waitJob(
          'accountant',
          data<{ jobId: string }>(res).jobId,
        );
        expect(`${key}/${format}: ${done.error ?? done.status}`).toBe(
          `${key}/${format}: DONE`,
        );
      }
    }
  });

  it('keeps stock from going negative and routes a concession through approval', async () => {
    const item = await prisma.inventoryItem.findFirstOrThrow({
      where: { sku: 'MRK-01' },
    });
    const res = await t('accountant')
      .post('/inventory/movements', {
        branchId,
        itemId: item.id,
        type: 'ISSUE',
        quantity: 999,
      })
      .expect(409);
    expect(errorCode(res)).toBe('NEGATIVE_STOCK');
    const student = await prisma.enrollment.findFirstOrThrow({
      where: { branchId, status: 'ACTIVE' },
    });
    const concession = await t('accountant')
      .post('/concessions', {
        studentId: student.studentId,
        type: 'FIXED',
        value: 10_000,
        from: month,
        reason: 'Hardship',
      })
      .expect(201);
    expect(
      data<{ status: string; approvalId: string }>(concession).status,
    ).toBe('PENDING');
  });
});
