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

/** Days a parent always gets to pay after an invoice is issued. */
export const ISSUE_GRACE_DAYS = 7;
const DAY_MS = 86_400_000;

/**
 * Due date fixed at issue: the plan's due date, but never earlier than
 * issue date + ISSUE_GRACE_DAYS, so an invoice issued late (e.g. on the 27th
 * for a plan due on the 10th) is not overdue, or liable to a late fee, on arrival.
 */
export function issueDueDate(planned: Date, issuedOn: Date): Date {
  const earliest = new Date(issuedOn.getTime() + ISSUE_GRACE_DAYS * DAY_MS);
  return planned < earliest ? earliest : planned;
}

export const balanceOf = (invoice: {
  totalMinor: bigint;
  paidMinor: bigint;
}): bigint => invoice.totalMinor - invoice.paidMinor;

/** What is still owed on the invoice: nothing once it is cancelled. */
export const shownBalanceOf = (invoice: {
  status: InvoiceStatus;
  totalMinor: bigint;
  paidMinor: bigint;
}): bigint => (invoice.status === 'CANCELLED' ? 0n : balanceOf(invoice));
