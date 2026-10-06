import type { InvoiceStatus } from '../../generated/prisma/client';

export interface InvoiceAmounts {
  status: InvoiceStatus;
  totalMinor: bigint;
  paidMinor: bigint;
  dueDate: Date;
}

/** Statuses that can still receive money. */
export const OPEN_STATUSES: InvoiceStatus[] = [
  'ISSUED',
  'PARTIALLY_PAID',
  'OVERDUE',
];

/**
 * Status after the paid amount changed (DRAFT/CANCELLED never move here).
 * Unpaid or part-paid past the due date is OVERDUE.
 */
export function settledStatus(
  invoice: InvoiceAmounts,
  today: Date,
): InvoiceStatus {
  if (invoice.status === 'DRAFT' || invoice.status === 'CANCELLED') {
    return invoice.status;
  }
  if (invoice.paidMinor >= invoice.totalMinor) return 'PAID';
  if (invoice.dueDate < today) return 'OVERDUE';
  return invoice.paidMinor > 0n ? 'PARTIALLY_PAID' : 'ISSUED';
}

export const balanceOf = (invoice: {
  totalMinor: bigint;
  paidMinor: bigint;
}): bigint => invoice.totalMinor - invoice.paidMinor;
