import type { ExpenseStatus } from '../../generated/prisma/client';
import { conflict } from '../../core/common/errors/errors';

/** Statuses that can still be edited (a rejected bill goes back to DRAFT). */
export const EDITABLE_STATUSES: ExpenseStatus[] = ['DRAFT', 'REJECTED'];

/** Statuses a payment can be recorded against. */
export const PAYABLE_STATUSES: ExpenseStatus[] = ['APPROVED', 'PARTIALLY_PAID'];

export interface PaymentOutcome {
  paidMinor: bigint;
  status: 'PARTIALLY_PAID' | 'PAID';
}

/** Adds a payment; never more than the remaining balance (409). */
export function applyExpensePayment(
  amountMinor: bigint,
  paidMinor: bigint,
  paymentMinor: bigint,
): PaymentOutcome {
  if (paymentMinor <= 0n) throw new Error('Payment must be positive');
  const remaining = amountMinor - paidMinor;
  if (paymentMinor > remaining) {
    throw conflict('Payment exceeds the remaining balance', {
      remainingMinor: Number(remaining),
    });
  }
  const paid = paidMinor + paymentMinor;
  return {
    paidMinor: paid,
    status: paid === amountMinor ? 'PAID' : 'PARTIALLY_PAID',
  };
}
