import type { InvoiceStatus } from '../../../generated/prisma/client';
import { OPEN_STATUSES } from '../../finance-core/invoice-state';
import { parseLateFeeRule } from '../shared/plan-snapshot';

export interface LateFeeCandidate {
  status: InvoiceStatus;
  dueDate: Date;
  totalMinor: bigint;
  paidMinor: bigint;
  lateFeeMinor: bigint;
  lateFeeRule: unknown;
}

const DAY_MS = 86_400_000;

/**
 * Late fee to add now (0n = none): the invoice is open with a balance, has a
 * rule, has no late fee yet, and today is after dueDate + afterDays.
 */
export function lateFeeDue(invoice: LateFeeCandidate, today: Date): bigint {
  if (!OPEN_STATUSES.includes(invoice.status)) return 0n;
  if (invoice.lateFeeMinor > 0n) return 0n;
  if (invoice.totalMinor - invoice.paidMinor <= 0n) return 0n;
  const rule = parseLateFeeRule(invoice.lateFeeRule);
  if (!rule) return 0n;
  const lastFreeDay = invoice.dueDate.getTime() + rule.afterDays * DAY_MS;
  return today.getTime() > lastFreeDay ? BigInt(rule.amountMinor) : 0n;
}
