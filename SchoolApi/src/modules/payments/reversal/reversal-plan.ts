import type { LedgerPosting } from '../../finance-core/ledger.service';
import { sumMinor } from '../../finance-core/money';

export interface ReversiblePayment {
  id: string;
  schoolId: string;
  branchId: string;
  studentId: string;
  amountMinor: bigint;
  unallocatedMinor: bigint;
}

export interface LiveAllocation {
  invoiceId: string;
  amountMinor: bigint;
  reversed: boolean;
}

export interface ReversalPlan {
  postings: LedgerPosting[];
  /** Change of `paidMinor` per invoice (negative: the invoice reopens). */
  invoiceDeltas: Map<string, bigint>;
  unallocatedAfter: bigint;
}

export class ReversalPlanError extends Error {}

/**
 * Pure plan of a payment reversal: one REVERSAL entry of +amount pointing at
 * the original PAYMENT entry (which stays untouched), every live allocation
 * released and the advance credit cleared. The payment must be whole:
 * live allocations + advance = amount (a refunded payment cannot be reversed).
 */
export function planReversal(
  payment: ReversiblePayment,
  allocations: readonly LiveAllocation[],
  original: { entryId: string; reason: string; actorId: string | null },
): ReversalPlan {
  const live = allocations.filter((a) => !a.reversed);
  const allocated = sumMinor(live.map((a) => a.amountMinor));
  if (allocated + payment.unallocatedMinor !== payment.amountMinor) {
    throw new ReversalPlanError(
      'Payment amounts do not add up (allocations + advance ≠ amount)',
    );
  }
  const invoiceDeltas = new Map<string, bigint>();
  for (const allocation of live) {
    invoiceDeltas.set(
      allocation.invoiceId,
      (invoiceDeltas.get(allocation.invoiceId) ?? 0n) - allocation.amountMinor,
    );
  }
  return {
    postings: [
      {
        schoolId: payment.schoolId,
        branchId: payment.branchId,
        studentId: payment.studentId,
        type: 'REVERSAL',
        amountMinor: payment.amountMinor,
        refType: 'Payment',
        refId: payment.id,
        paymentId: payment.id,
        reversesId: original.entryId,
        reason: original.reason,
        createdById: original.actorId,
      },
    ],
    invoiceDeltas,
    unallocatedAfter: 0n,
  };
}
