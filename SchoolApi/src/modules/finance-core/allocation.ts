import { minBig, sumMinor } from './money';

export interface OpenInvoice {
  id: string;
  dueDate: Date;
  /** Tie-breaker for equal due dates (creation order). */
  createdAt: Date;
  balanceMinor: bigint;
}

export interface Allocation {
  invoiceId: string;
  amountMinor: bigint;
}

export interface AllocationPlan {
  allocations: Allocation[];
  /** Left over after allocation: kept as advance credit. */
  advanceMinor: bigint;
}

export class AllocationError extends Error {}

/**
 * contract B3: explicit allocations when given (each ≤ the invoice balance),
 * otherwise oldest due first; whatever is left is advance credit.
 */
export function planAllocation(
  open: readonly OpenInvoice[],
  amountMinor: bigint,
  explicit?: readonly Allocation[],
): AllocationPlan {
  if (amountMinor <= 0n) throw new AllocationError('Amount must be positive');
  if (explicit && explicit.length > 0) {
    return planExplicit(open, amountMinor, explicit);
  }
  const ordered = [...open]
    .filter((invoice) => invoice.balanceMinor > 0n)
    .sort(
      (a, b) =>
        a.dueDate.getTime() - b.dueDate.getTime() ||
        a.createdAt.getTime() - b.createdAt.getTime() ||
        a.id.localeCompare(b.id),
    );
  const allocations: Allocation[] = [];
  let left = amountMinor;
  for (const invoice of ordered) {
    if (left === 0n) break;
    const amount = minBig(left, invoice.balanceMinor);
    allocations.push({ invoiceId: invoice.id, amountMinor: amount });
    left -= amount;
  }
  return { allocations, advanceMinor: left };
}

function planExplicit(
  open: readonly OpenInvoice[],
  amountMinor: bigint,
  explicit: readonly Allocation[],
): AllocationPlan {
  const byId = new Map(open.map((invoice) => [invoice.id, invoice]));
  const seen = new Set<string>();
  for (const allocation of explicit) {
    const invoice = byId.get(allocation.invoiceId);
    if (!invoice) {
      throw new AllocationError(
        `Invoice ${allocation.invoiceId} is not open for this student`,
      );
    }
    if (seen.has(allocation.invoiceId)) {
      throw new AllocationError('Duplicate invoice in allocations');
    }
    seen.add(allocation.invoiceId);
    if (allocation.amountMinor <= 0n) {
      throw new AllocationError('Allocation amounts must be positive');
    }
    if (allocation.amountMinor > invoice.balanceMinor) {
      throw new AllocationError(
        `Allocation exceeds the balance of invoice ${allocation.invoiceId}`,
      );
    }
  }
  const allocated = sumMinor(explicit.map((a) => a.amountMinor));
  if (allocated > amountMinor) {
    throw new AllocationError('Allocations exceed the payment amount');
  }
  return {
    allocations: explicit.map((a) => ({
      invoiceId: a.invoiceId,
      amountMinor: a.amountMinor,
    })),
    advanceMinor: amountMinor - allocated,
  };
}
