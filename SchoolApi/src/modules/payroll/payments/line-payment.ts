import type {
  PayrollLineStatus,
  PayrollRunStatus,
} from '../../../generated/prisma/client';
import { forbidden } from '../../../core/common/errors/errors';

/** Four-eyes: whoever disburses salaries never pays their own (403). */
export function assertNotOwnSalary(
  staffUserId: string | null | undefined,
  actorId: string,
): void {
  if (staffUserId && staffUserId === actorId) {
    throw forbidden(
      'You cannot record a payment of your own salary; another finance user must record it',
    );
  }
}

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
