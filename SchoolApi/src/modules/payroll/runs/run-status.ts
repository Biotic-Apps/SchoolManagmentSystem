import type { PayrollRunStatus } from '../../../generated/prisma/client';

/** Approved runs (and later) are frozen: lines and adjustments are final. */
export const APPROVED_STATUSES: PayrollRunStatus[] = [
  'APPROVED',
  'PARTIALLY_PAID',
  'PAID',
  'CLOSED',
];

/** Runs that may be (re)calculated. */
export const CALCULABLE_STATUSES: PayrollRunStatus[] = [
  'DRAFT',
  'CALCULATED',
  'REVIEWED',
];

/** Runs that accept salary payments. */
export const PAYABLE_STATUSES: PayrollRunStatus[] = [
  'APPROVED',
  'PARTIALLY_PAID',
];

export const isApproved = (status: PayrollRunStatus): boolean =>
  APPROVED_STATUSES.includes(status);
