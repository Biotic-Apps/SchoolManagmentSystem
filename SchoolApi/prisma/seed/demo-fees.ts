import { writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import type { SeedClient } from './client';
import { addDays, type DailyContext, userId } from './demo-daily-context';
import {
  addMonths,
  day,
  iso,
  loadCounters,
  nextInvoiceNo,
  recordPayment,
  saveCounters,
  statusOf,
  type Counters,
} from './demo-finance-helpers';

const HEADS = [
  {
    code: 'TUITION',
    name: 'Tuition Fee',
    kind: 'RECURRING',
    refundable: false,
  },
  {
    code: 'ADMISSION',
    name: 'Admission Fee',
    kind: 'ONE_TIME',
    refundable: false,
  },
  {
    code: 'EXAM',
    name: 'Examination Fee',
    kind: 'RECURRING',
    refundable: false,
  },
  {
    code: 'TRANSPORT',
    name: 'Transport Fee',
    kind: 'RECURRING',
    refundable: false,
  },
  {
    code: 'COMPLAB',
    name: 'Computer Lab Fee',
    kind: 'RECURRING',
    refundable: false,
  },
] as const;

const LATE_FEE = { amountMinor: 20_000, afterDays: 10 };
const DUE_DAY = 10;
const tuitionOf = (level: number) => 300_000 + 50_000 * level;
const TERM_START_MONTHS = ['04', '10'];

async function seedHeadsAndPlans(prisma: SeedClient, ctx: DailyContext) {
  const heads = new Map<string, string>();
  for (const head of HEADS) {
    const row = await prisma.feeHead.upsert({
      where: { schoolId_code: { schoolId: ctx.org.schoolId, code: head.code } },
      create: { schoolId: ctx.org.schoolId, ...head },
      update: {},
    });
    heads.set(head.code, row.id);
  }
  const accountant = userId(ctx, 'accountant@eschool.local');
  for (let level = 1; level <= 5; level++) {
    const classId = ctx.org.classes.get(`Class ${level}`)!;
    const name = `Class ${level} 2026-27`;
    if (
      await prisma.feePlan.findFirst({
        where: { sessionId: ctx.org.sessionId, classId, name },
      })
    )
      continue;
    const items = [
      {
        feeHeadId: heads.get('TUITION')!,
        amountMinor: tuitionOf(level),
        frequency: 'MONTHLY' as const,
        dueDay: DUE_DAY,
      },
      {
        feeHeadId: heads.get('COMPLAB')!,
        amountMinor: 50_000,
        frequency: 'MONTHLY' as const,
        dueDay: DUE_DAY,
      },
      {
        feeHeadId: heads.get('EXAM')!,
        amountMinor: 100_000,
        frequency: 'TERM' as const,
        dueDay: DUE_DAY,
      },
    ];
    await prisma.feePlan.create({
      data: {
        schoolId: ctx.org.schoolId,
        branchId: ctx.org.branchId,
        sessionId: ctx.org.sessionId,
        classId,
        name,
        status: 'APPROVED',
        lateFeeMinor: BigInt(LATE_FEE.amountMinor),
        lateFeeAfterDays: LATE_FEE.afterDays,
        approvedSnapshot: { revision: 1, items, lateFee: LATE_FEE },
        approvedById: userId(ctx, 'principal@eschool.local'),
        approvedAt: new Date(),
        createdById: accountant,
        items: {
          create: items.map((i) => ({
            ...i,
            amountMinor: BigInt(i.amountMinor),
          })),
        },
      },
    });
  }
  return heads;
}

/** Share of an invoice paid: 0, 1 (half) or 2 (full) per scenario. */
function paidShare(section: string, i: number, month: number): 0 | 1 | 2 {
  if (section === '4-B' && i === 0) return 2; // Omar: all paid
  if (section === '5-A' && i === 0) return month === 1 ? 0 : 2; // Ayesha: last month open (proof pending)
  if (month === 0) return i % 5 === 1 ? 1 : 2;
  if (month === 1) return i % 3 === 1 ? 0 : 2;
  return i % 3 === 0 ? 2 : i % 3 === 1 ? 0 : 1;
}

interface InvoiceCtx {
  ctx: DailyContext;
  counters: Counters;
  heads: Map<string, string>;
  accountant: string;
  yesterday: Date;
}

async function seedInvoice(
  prisma: SeedClient,
  ic: InvoiceCtx,
  section: string,
  i: number,
  period: string,
  month: number,
) {
  const { ctx } = ic;
  const student = ctx.students.get(section)![i];
  const level = Number(section[0]);
  const lines = [
    {
      feeHeadId: ic.heads.get('TUITION')!,
      description: `Tuition Fee ${period}`,
      amountMinor: BigInt(tuitionOf(level)),
    },
    {
      feeHeadId: ic.heads.get('COMPLAB')!,
      description: `Computer Lab Fee ${period}`,
      amountMinor: 50_000n,
    },
  ];
  if (TERM_START_MONTHS.includes(period.slice(5))) {
    lines.push({
      feeHeadId: ic.heads.get('EXAM')!,
      description: `Examination Fee ${period}`,
      amountMinor: 100_000n,
    });
  }
  const subtotal = lines.reduce((s, l) => s + l.amountMinor, 0n);
  const due = day(`${period}-${String(DUE_DAY).padStart(2, '0')}`);
  const issued = day(`${period}-01`);
  const share =
    section === '5-B' && i === 1 && month === 2
      ? 2
      : paidShare(section, i, month);
  const paid = share === 2 ? subtotal : share === 1 ? subtotal / 2n : 0n;
  const lateDue =
    addDays(due, LATE_FEE.afterDays) < ctx.today && paid < subtotal;
  const lateFee = lateDue ? BigInt(LATE_FEE.amountMinor) : 0n;
  const total = subtotal + lateFee;
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNo: nextInvoiceNo(ic.counters, period),
      schoolId: ctx.org.schoolId,
      branchId: ctx.org.branchId,
      sessionId: ctx.org.sessionId,
      studentId: student.id,
      sectionId: ctx.org.sections.get(section)!,
      classId: ctx.org.classes.get(`Class ${level}`)!,
      period,
      source: 'GENERATED',
      status: statusOf(total, paid, due, ctx.today),
      issueDate: issued,
      dueDate: due,
      subtotalMinor: subtotal,
      lateFeeMinor: lateFee,
      totalMinor: total,
      paidMinor: paid,
      lateFeeRule: LATE_FEE,
      issuedById: ic.accountant,
      createdById: ic.accountant,
      createdAt: issued,
      lines: { create: lines },
    },
  });
  const base = {
    schoolId: ctx.org.schoolId,
    branchId: ctx.org.branchId,
    studentId: student.id,
    invoiceId: invoice.id,
    refType: 'Invoice',
    refId: invoice.id,
    createdById: ic.accountant,
  };
  await prisma.ledgerEntry.create({
    data: { ...base, type: 'CHARGE', amountMinor: subtotal, createdAt: issued },
  });
  if (lateFee > 0n) {
    await prisma.ledgerEntry.create({
      data: {
        ...base,
        type: 'LATE_FEE',
        amountMinor: lateFee,
        reason: 'Late payment fee',
        createdAt: addDays(due, LATE_FEE.afterDays + 1),
      },
    });
  }
  if (paid === 0n) return invoice;
  const paidYesterday = section === '5-B' && i === 1 && month === 2;
  const usual = addDays(due, -2);
  const receivedOn = paidYesterday
    ? ic.yesterday
    : usual < ctx.today
      ? usual
      : ic.yesterday;
  await recordPayment(prisma, ctx, ic.counters, {
    studentId: student.id,
    amountMinor: paid,
    method: paidYesterday || i % 2 === 0 ? 'CASH' : 'BANK',
    reference:
      paidYesterday || i % 2 === 0
        ? undefined
        : `HBL-${period.replace('-', '')}-${i + 1}`,
    receivedOn,
    receivedById: ic.accountant,
    allocations: [{ invoiceId: invoice.id, amountMinor: paid }],
  });
  return invoice;
}

async function seedProof(
  prisma: SeedClient,
  ctx: DailyContext,
  invoiceId: string,
  studentId: string,
  amount: bigint,
) {
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  );
  const storageKey = 'seed/payment-proof.png';
  const target = resolve(
    process.env.STORAGE_LOCAL_DIR ?? 'storage',
    storageKey,
  );
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, png);
  const parent = userId(ctx, 'parent@eschool.local');
  const file = await prisma.file.upsert({
    where: { storageKey },
    create: {
      schoolId: ctx.org.schoolId,
      purpose: 'DOCUMENT',
      storageKey,
      originalName: 'bank-slip.png',
      mime: 'image/png',
      size: png.length,
      sha256: createHash('sha256').update(png).digest('hex'),
      uploadedById: parent,
      scanStatus: 'CLEAN',
    },
    update: {},
  });
  await prisma.paymentProof.create({
    data: {
      schoolId: ctx.org.schoolId,
      branchId: ctx.org.branchId,
      studentId,
      invoiceId,
      amountMinor: amount,
      paidOn: addDays(ctx.today, -1),
      method: 'BANK',
      reference: 'MCB-TRX-552901',
      fileId: file.id,
      submittedById: parent,
    },
  });
}

async function seedConcession(
  prisma: SeedClient,
  ctx: DailyContext,
  heads: Map<string, string>,
) {
  const student = ctx.students.get('5-B')![2];
  const accountant = userId(ctx, 'accountant@eschool.local');
  const estimate = (BigInt(tuitionOf(5)) * 25n + 50n) / 100n;
  const concession = await prisma.concession.create({
    data: {
      schoolId: ctx.org.schoolId,
      branchId: ctx.org.branchId,
      studentId: student.id,
      feeHeadId: heads.get('TUITION')!,
      type: 'PERCENT',
      value: 25n,
      fromPeriod: addMonths(ctx.today.toISOString().slice(0, 7), 1),
      reason: 'Sibling discount (two children enrolled)',
      estimateMinor: estimate,
      requestedById: accountant,
    },
  });
  const approval = await prisma.approvalRequest.create({
    data: {
      type: 'CONCESSION',
      entityType: 'Concession',
      entityId: concession.id,
      schoolId: ctx.org.schoolId,
      branchId: ctx.org.branchId,
      requestedById: accountant,
      title: `Concession: ${student.name} 25% tuition`,
      amountMinor: estimate,
      payload: { concessionId: concession.id },
      reason: concession.reason,
      steps: {
        create: [
          { order: 1, approverRole: 'PRINCIPAL', amountLimitMinor: 2_500_000n },
          { order: 2, approverRole: 'SUPER_ADMIN' },
        ],
      },
    },
  });
  await prisma.concession.update({
    where: { id: concession.id },
    data: { approvalId: approval.id },
  });
}

async function closeYesterday(
  prisma: SeedClient,
  ctx: DailyContext,
  yesterday: Date,
) {
  const payments = await prisma.payment.findMany({
    where: {
      branchId: ctx.org.branchId,
      receivedOn: yesterday,
      status: 'RECORDED',
    },
  });
  const byMethod: Record<string, number> = {};
  for (const p of payments)
    byMethod[p.method] = (byMethod[p.method] ?? 0) + Number(p.amountMinor);
  const cash = BigInt(byMethod.CASH ?? 0);
  await prisma.dailyCollection.create({
    data: {
      schoolId: ctx.org.schoolId,
      branchId: ctx.org.branchId,
      date: yesterday,
      totals: {
        byMethod,
        count: payments.length,
        totalMinor: payments.reduce((s, p) => s + Number(p.amountMinor), 0),
      },
      cashExpectedMinor: cash,
      cashCountedMinor: cash,
      differenceMinor: 0n,
      note: 'Cash counted and deposited',
      closedById: userId(ctx, 'accountant@eschool.local'),
    },
  });
}

/** Phase 4 §J fees: heads, plans, 3 months of invoices with payments, a proof, a concession, a closed day. */
export async function seedFees(
  prisma: SeedClient,
  ctx: DailyContext,
): Promise<void> {
  const heads = await seedHeadsAndPlans(prisma, ctx);
  if (await prisma.invoice.findFirst({ where: { branchId: ctx.org.branchId } }))
    return;
  const counters = await loadCounters(prisma, ctx);
  const current = iso(ctx.today).slice(0, 7);
  const yesterday = addDays(ctx.today, -1);
  const ic: InvoiceCtx = {
    ctx,
    counters,
    heads,
    accountant: userId(ctx, 'accountant@eschool.local'),
    yesterday,
  };
  let ayeshaInvoice: {
    id: string;
    studentId: string;
    totalMinor: bigint;
  } | null = null;
  for (const [month, period] of [
    addMonths(current, -2),
    addMonths(current, -1),
    current,
  ].entries()) {
    for (const section of ['4-A', '4-B', '5-A', '5-B']) {
      for (let i = 0; i < (ctx.students.get(section)?.length ?? 0); i++) {
        const invoice = await seedInvoice(
          prisma,
          ic,
          section,
          i,
          period,
          month,
        );
        if (section === '5-A' && i === 0 && month === 1)
          ayeshaInvoice = invoice;
      }
    }
  }
  await saveCounters(prisma, ctx, counters);
  if (ayeshaInvoice)
    await seedProof(
      prisma,
      ctx,
      ayeshaInvoice.id,
      ayeshaInvoice.studentId,
      ayeshaInvoice.totalMinor,
    );
  await seedConcession(prisma, ctx, heads);
  await closeYesterday(prisma, ctx, yesterday);
}
