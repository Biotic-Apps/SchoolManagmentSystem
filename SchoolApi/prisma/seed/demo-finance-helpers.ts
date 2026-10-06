import type {
  InvoiceStatus,
  PaymentMethod,
} from '../../src/generated/prisma/client';
import type { SeedClient } from './client';
import type { DailyContext } from './demo-daily-context';
import { bumpSequence } from './demo-people';

export const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
export const iso = (date: Date) => date.toISOString().slice(0, 10);

export function addMonths(period: string, months: number): string {
  const [y, m] = period.split('-').map(Number);
  const index = y * 12 + (m - 1) + months;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`;
}

/** Same rule as finance-core settledStatus. */
export function statusOf(
  total: bigint,
  paid: bigint,
  due: Date,
  today: Date,
): InvoiceStatus {
  if (paid >= total) return 'PAID';
  if (due < today) return 'OVERDUE';
  return paid > 0n ? 'PARTIALLY_PAID' : 'ISSUED';
}

export interface Counters {
  invoice: Map<string, number>;
  receipt: Map<number, number>;
}

export async function loadCounters(
  prisma: SeedClient,
  ctx: DailyContext,
): Promise<Counters> {
  const rows = await prisma.sequence.findMany({
    where: {
      OR: [
        { scopeKey: { startsWith: `invoice:${ctx.org.branchId}:` } },
        { scopeKey: { startsWith: `receipt:${ctx.org.branchId}:` } },
      ],
    },
  });
  const counters: Counters = { invoice: new Map(), receipt: new Map() };
  for (const row of rows) {
    const key = row.scopeKey.split(':')[2];
    if (row.scopeKey.startsWith('invoice:'))
      counters.invoice.set(key, Number(row.nextValue) - 1);
    else counters.receipt.set(Number(key), Number(row.nextValue) - 1);
  }
  return counters;
}

export async function saveCounters(
  prisma: SeedClient,
  ctx: DailyContext,
  counters: Counters,
): Promise<void> {
  for (const [month, n] of counters.invoice)
    await bumpSequence(prisma, `invoice:${ctx.org.branchId}:${month}`, n + 1);
  for (const [year, n] of counters.receipt)
    await bumpSequence(prisma, `receipt:${ctx.org.branchId}:${year}`, n + 1);
}

export function nextInvoiceNo(counters: Counters, period: string): string {
  const month = period.replace('-', '');
  const n = (counters.invoice.get(month) ?? 0) + 1;
  counters.invoice.set(month, n);
  return `INV-MAIN-${month}-${String(n).padStart(4, '0')}`;
}

export function nextReceiptNo(counters: Counters, on: Date): string {
  const year = on.getUTCFullYear();
  const n = (counters.receipt.get(year) ?? 0) + 1;
  counters.receipt.set(year, n);
  return `RCT-MAIN-${year}-${String(n).padStart(4, '0')}`;
}

export interface SeedPayment {
  studentId: string;
  amountMinor: bigint;
  method: PaymentMethod;
  receivedOn: Date;
  receivedById: string;
  allocations: { invoiceId: string; amountMinor: bigint }[];
  reference?: string;
}

/** Payment + allocations + one PAYMENT ledger entry (−amount), like PaymentRecorder. */
export async function recordPayment(
  prisma: SeedClient,
  ctx: DailyContext,
  counters: Counters,
  p: SeedPayment,
) {
  const allocated = p.allocations.reduce((sum, a) => sum + a.amountMinor, 0n);
  const payment = await prisma.payment.create({
    data: {
      receiptNo: nextReceiptNo(counters, p.receivedOn),
      schoolId: ctx.org.schoolId,
      branchId: ctx.org.branchId,
      studentId: p.studentId,
      amountMinor: p.amountMinor,
      unallocatedMinor: p.amountMinor - allocated,
      method: p.method,
      reference: p.reference ?? null,
      receivedOn: p.receivedOn,
      receivedById: p.receivedById,
      createdAt: new Date(p.receivedOn.getTime() + 10 * 3600_000),
      allocations: {
        create: p.allocations.map((a) => ({
          invoiceId: a.invoiceId,
          amountMinor: a.amountMinor,
        })),
      },
    },
  });
  await prisma.ledgerEntry.create({
    data: {
      schoolId: ctx.org.schoolId,
      branchId: ctx.org.branchId,
      studentId: p.studentId,
      paymentId: payment.id,
      type: 'PAYMENT',
      amountMinor: -p.amountMinor,
      refType: 'Payment',
      refId: payment.id,
      createdById: p.receivedById,
      createdAt: payment.createdAt,
    },
  });
  return payment;
}
