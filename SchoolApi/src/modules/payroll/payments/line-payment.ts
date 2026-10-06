import type {
  PayrollLineStatus,
  PayrollRunStatus,
} from '../../../generated/prisma/client';

/** Line status from what was paid against its net. */
export function lineStatusOf(
  netMinor: bigint,
  paidMinor: bigint,
): PayrollLineStatus {
  if (paidMinor >= netMinor) return 'PAID';
  return paidMinor > 0n ? 'PARTIALLY_PAID' : 'UNPAID';
}

/** Run status after a payment: PAID once every line is paid. */
export const runStatusAfterPayment = (
  lineStatuses: PayrollLineStatus[],
): PayrollRunStatus =>
  lineStatuses.every((s) => s === 'PAID') ? 'PAID' : 'PARTIALLY_PAID';
