import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { PrismaService } from '../src/core/prisma/prisma.service';
import { API, as, createTestApp, errorCode, login } from './support/test-app';

const data = <T>(res: { body: unknown }) => (res.body as { data: T }).data;

interface Child {
  id: string;
  name: string;
  className: string;
}
interface Exam {
  id: string;
  name: string;
  status: string;
}
interface Sheet {
  id: string;
  status: string;
  sectionId: string;
  paper: { subject: { name: string } };
}
interface Invoice {
  id: string;
  invoiceNo: string;
  status: string;
  totalMinor: number;
  paidMinor: number;
  balanceMinor: number;
}
interface LedgerView {
  entries: { type: string; amountMinor: number }[];
  balanceMinor: number;
}
interface Job {
  status: string;
  result?: { count?: number };
}

const isoDay = (offset = 0) =>
  new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);

describe('Finance and results (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens: Record<string, string> = {};
  const t = (who: string) => as(app, tokens[who]);
  let branchId: string;
  let ayesha: Child;
  let omar: Child;
  let midterm: Exam;
  let final: Exam;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    for (const who of [
      'principal',
      'coordinator',
      'teacher',
      'accountant',
      'parent',
      'admin',
    ]) {
      tokens[who] = (await login(app, `${who}@eschool.local`)).accessToken;
    }
    const me = data<{ children: Child[] }>(await t('parent').get('/me'));
    ayesha = me.children.find((c) => c.className === 'Class 5')!;
    omar = me.children.find((c) => c.className === 'Class 4')!;
    branchId = (
      await prisma.branch.findFirstOrThrow({ where: { code: 'MAIN' } })
    ).id;
    const exams = data<Exam[]>(
      await t('principal')
        .get(`/exams?branchId=${branchId}&pageSize=50`)
        .expect(200),
    );
    midterm = exams.find((e) => e.status === 'PUBLISHED')!;
    final = exams.find((e) => e.status === 'MARKS_OPEN')!;
  });

  afterAll(async () => {
    await app.close();
  });

  async function waitJob(who: string, jobId: string): Promise<Job> {
    for (let i = 0; i < 100; i++) {
      const job = data<Job>(await t(who).get(`/jobs/${jobId}`).expect(200));
      if (job.status === 'DONE' || job.status === 'FAILED') return job;
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error('job did not finish');
  }

  const ledger = async (studentId: string) =>
    data<LedgerView>(
      await t('accountant').get(`/students/${studentId}/ledger`).expect(200),
    );

  describe('results', () => {
    it('refuses to submit a mark sheet with a pending row', async () => {
      const fiveA = (
        await prisma.section.findFirstOrThrow({
          where: { name: 'A', schoolClass: { name: 'Class 5' }, branchId },
        })
      ).id;
      const sheets = data<Sheet[]>(
        await t('teacher')
          .get(`/exams/${final.id}/mark-sheets?sectionId=${fiveA}`)
          .expect(200),
      );
      const maths = sheets.find((s) => s.paper.subject.name === 'Mathematics')!;
      expect(maths.status).toBe('DRAFT');
      const res = await t('teacher')
        .post(`/mark-sheets/${maths.id}/submit`)
        .expect(400);
      expect(errorCode(res)).toBe('VALIDATION_FAILED');
      const after = data<{
        status: string;
        rows: { marks: number | null; absent: boolean }[];
      }>(await t('teacher').get(`/mark-sheets/${maths.id}`).expect(200));
      expect(after.status).toBe('DRAFT');
      expect(after.rows.some((r) => r.marks === null && !r.absent)).toBe(true);
    });

    it('requires every mark sheet to be accepted before results are approved or published', async () => {
      const res = await t('coordinator').post(
        `/exams/${final.id}/approve-results`,
      );
      expect(res.status).toBe(409);
      expect(
        await t('principal')
          .post(`/exams/${final.id}/publish`)
          .then((r) => r.status),
      ).toBe(409);
      const exam = data<Exam>(
        await t('principal').get(`/exams/${final.id}`).expect(200),
      );
      expect(exam.status).toBe('MARKS_OPEN');
    });

    it('shows parents only published results of their own children', async () => {
      const rows = data<{ studentId: string }[]>(
        await t('parent').get(`/results?examId=${midterm.id}`).expect(200),
      );
      expect(rows.length).toBeGreaterThan(0);
      expect(
        rows.every((r) => [ayesha.id, omar.id].includes(r.studentId)),
      ).toBe(true);

      const unpublished = await t('parent').get(`/results?examId=${final.id}`);
      expect([200, 404]).toContain(unpublished.status);
      if (unpublished.status === 200)
        expect(data<unknown[]>(unpublished)).toHaveLength(0);

      const other = await prisma.enrollment.findFirstOrThrow({
        where: { status: 'ACTIVE', studentId: { notIn: [ayesha.id, omar.id] } },
      });
      await t('parent').get(`/students/${other.studentId}/results`).expect(404);
      const own = data<{ results: unknown[] } | unknown[]>(
        await t('parent').get(`/students/${ayesha.id}/results`).expect(200),
      );
      expect(own).toBeTruthy();
    });
  });

  describe('fees and payments', () => {
    it('generates invoices as a pollable, idempotent job', async () => {
      const sessionId = (
        await prisma.academicSession.findFirstOrThrow({
          where: { branchId, status: 'ACTIVE' },
        })
      ).id;
      const next = new Date();
      next.setUTCMonth(next.getUTCMonth() + 1);
      const period = next.toISOString().slice(0, 7);
      const body = { branchId, sessionId, period };
      const first = data<{ jobId: string }>(
        await t('accountant').post('/invoices/generate', body).expect(200),
      );
      const job = await waitJob('accountant', first.jobId);
      expect(job.status).toBe('DONE');
      expect(job.result?.count).toBeGreaterThan(0);
      const again = data<{ jobId: string }>(
        await t('accountant').post('/invoices/generate', body).expect(200),
      );
      const second = await waitJob('accountant', again.jobId);
      expect(second.status).toBe('DONE');
      expect(second.result?.count).toBe(0);
      await t('parent').get(`/jobs/${first.jobId}`).expect(404);
    });

    it('never changes the invoice for an uploaded proof until it is verified', async () => {
      const head = await prisma.feeHead.findFirstOrThrow({
        where: { code: 'ADMISSION' },
      });
      const draft = data<Invoice>(
        await t('accountant')
          .post('/invoices', {
            studentId: omar.id,
            dueDate: isoDay(10),
            lines: [
              {
                feeHeadId: head.id,
                description: 'Library deposit',
                amountMinor: 250_000,
              },
            ],
          })
          .expect(201),
      );
      await t('accountant')
        .post('/invoices/issue', { invoiceIds: [draft.id] })
        .expect(200);
      const before = await ledger(omar.id);

      const upload = await request(app.getHttpServer())
        .post(`${API}/files`)
        .set('Authorization', `Bearer ${tokens.parent}`)
        .field('purpose', 'DOCUMENT')
        .attach('file', Buffer.from('%PDF-1.4\n%%EOF\n'), {
          filename: 'slip.pdf',
          contentType: 'application/pdf',
        })
        .expect(201);
      const fileId = data<{ id: string }>(upload).id;
      const proof = data<{ id: string; status: string }>(
        await t('parent')
          .post('/payment-proofs', {
            invoiceId: draft.id,
            amountMinor: 250_000,
            paidOn: isoDay(0),
            method: 'BANK',
            reference: 'E2E-TRX-1',
            fileId,
          })
          .expect(201),
      );
      expect(proof.status).toBe('SUBMITTED');

      const pending = data<Invoice>(
        await t('accountant').get(`/invoices/${draft.id}`).expect(200),
      );
      expect(pending.status).toBe('ISSUED');
      expect(pending.paidMinor).toBe(0);
      expect((await ledger(omar.id)).balanceMinor).toBe(before.balanceMinor);

      await t('accountant')
        .post(`/payment-proofs/${proof.id}/verify`, {})
        .expect(200);
      const paid = data<Invoice>(
        await t('accountant').get(`/invoices/${draft.id}`).expect(200),
      );
      expect(paid.status).toBe('PAID');
      expect(paid.balanceMinor).toBe(0);
      expect((await ledger(omar.id)).balanceMinor).toBe(
        before.balanceMinor - 250_000,
      );
    });

    it('reverses a payment with a new counter-entry and restores the balance', async () => {
      const debtor = await prisma.invoice.findFirstOrThrow({
        where: { branchId, status: 'OVERDUE', paidMinor: 0 },
        orderBy: { dueDate: 'asc' },
      });
      const before = await ledger(debtor.studentId);
      const payment = data<{ id: string; amountMinor: number }>(
        await t('accountant')
          .post('/payments', {
            studentId: debtor.studentId,
            amountMinor: 100_000,
            method: 'CASH',
            receivedOn: isoDay(0),
            allocations: [{ invoiceId: debtor.id, amountMinor: 100_000 }],
            clientRequestId: `e2e-pay-${Date.now()}`,
          })
          .expect(201),
      );
      const paidInvoice = await prisma.invoice.findUniqueOrThrow({
        where: { id: debtor.id },
      });
      expect(paidInvoice.paidMinor).toBe(100_000n);
      expect((await ledger(debtor.studentId)).balanceMinor).toBe(
        before.balanceMinor - 100_000,
      );

      await t('accountant')
        .post(`/payments/${payment.id}/reverse`, { reason: 'Cheque bounced' })
        .expect(200);
      const approval = await prisma.approvalRequest.findFirstOrThrow({
        where: { type: 'PAYMENT_REVERSAL', entityId: payment.id },
      });
      await t('principal')
        .post(`/approvals/${approval.id}/decide`, { decision: 'APPROVED' })
        .expect(200);

      const after = await ledger(debtor.studentId);
      expect(after.balanceMinor).toBe(before.balanceMinor);
      const entries = await prisma.ledgerEntry.findMany({
        where: { paymentId: payment.id },
        orderBy: { createdAt: 'asc' },
      });
      expect(entries.map((e) => [e.type, e.amountMinor])).toEqual([
        ['PAYMENT', -100_000n],
        ['REVERSAL', 100_000n],
      ]);
      const reopened = await prisma.invoice.findUniqueOrThrow({
        where: { id: debtor.id },
      });
      expect(reopened.paidMinor).toBe(0n);
      expect(reopened.status).toBe('OVERDUE');
    });

    it('blocks ledger updates and deletes in the database', async () => {
      const entry = await prisma.ledgerEntry.findFirstOrThrow();
      await expect(
        prisma.$executeRaw`UPDATE ledger_entries SET amount_minor = 1 WHERE id = ${entry.id}::uuid`,
      ).rejects.toThrow(/append-only/);
      await expect(
        prisma.$executeRaw`DELETE FROM ledger_entries WHERE id = ${entry.id}::uuid`,
      ).rejects.toThrow(/append-only/);
    });
  });

  describe('payroll privacy', () => {
    it('lets a teacher read only their own payslip', async () => {
      const last = new Date();
      last.setUTCDate(1);
      last.setUTCMonth(last.getUTCMonth() - 1);
      const month = last.toISOString().slice(0, 7);
      const own = await t('teacher')
        .get(`/payslips/me?month=${month}`)
        .expect(200);
      expect(data<{ netMinor: number }>(own).netMinor).toBeGreaterThan(0);
      const other = await prisma.staff.findFirstOrThrow({
        where: { user: { email: 'teacher2@eschool.local' } },
      });
      const res = await t('teacher').get(
        `/payslips/${other.id}?month=${month}`,
      );
      expect([403, 404]).toContain(res.status);
      await t('teacher').get(`/payroll/runs?branchId=${branchId}`).expect(403);
    });
  });

  describe('certificates', () => {
    it('blocks a school leaving certificate while dues are outstanding', async () => {
      const cert = await prisma.certificate.findFirstOrThrow({
        where: { type: 'SCHOOL_LEAVING', status: 'REQUESTED' },
      });
      const res = await t('principal')
        .post(`/certificates/${cert.id}/approve`, {})
        .expect(409);
      expect(errorCode(res)).toBe('CLEARANCE_REQUIRED');
      const still = await prisma.certificate.findUniqueOrThrow({
        where: { id: cert.id },
      });
      expect(still.status).toBe('REQUESTED');
    });

    it('verifies an issued serial publicly with minimal data', async () => {
      const cert = await prisma.certificate.findFirstOrThrow({
        where: { status: 'ISSUED' },
      });
      const res = await request(app.getHttpServer())
        .get(`${API}/certificates/verify/${cert.serialNo}`)
        .expect(200);
      expect(Object.keys(data<object>(res)).sort()).toEqual([
        'issuedOn',
        'studentName',
        'type',
        'valid',
      ]);
    });
  });
});
