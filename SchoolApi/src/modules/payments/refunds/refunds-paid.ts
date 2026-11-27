import type { PaymentMethod, Prisma } from '../../../generated/prisma/client';
import { schoolDateTime } from '../../../core/common/school-time';

/** `YYYY-MM-DD` of the day after `date`. */
export function nextDate(date: string): string {
  const day = new Date(`${date}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() + 1);
  return day.toISOString().slice(0, 10);
}

/**
 * Instants of school days `from`..`to` (inclusive). A refund is money paid
 * out when it is approved, so refunds are dated by `decidedAt`.
 */
export function schoolDaysRange(
  from: string,
  to: string,
): { gte: Date; lt: Date } {
  return {
    gte: schoolDateTime(from, '00:00'),
    lt: schoolDateTime(nextDate(to), '00:00'),
  };
}

/** Approved refunds paid out in the branch(es) on school days `from`..`to`. */
export function refundsPaidWhere(
  branch: Prisma.RefundWhereInput,
  from: string,
  to: string = from,
): Prisma.RefundWhereInput {
  return {
    AND: [branch],
    status: 'APPROVED',
    decidedAt: schoolDaysRange(from, to),
  };
}

export interface PaidRefund {
  method: PaymentMethod;
  amountMinor: bigint;
}

export interface RefundTotals {
  count: number;
  totalMinor: bigint;
  /** Paid back in cash: leaves the cash drawer. */
  cashMinor: bigint;
}

export function refundTotals(refunds: readonly PaidRefund[]): RefundTotals {
  return refunds.reduce<RefundTotals>(
    (totals, refund) => ({
      count: totals.count + 1,
      totalMinor: totals.totalMinor + refund.amountMinor,
      cashMinor:
        totals.cashMinor + (refund.method === 'CASH' ? refund.amountMinor : 0n),
    }),
    { count: 0, totalMinor: 0n, cashMinor: 0n },
  );
}
