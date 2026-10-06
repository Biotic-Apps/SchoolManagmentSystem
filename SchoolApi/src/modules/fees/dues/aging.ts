const DAY_MS = 86_400_000;

export interface AgingInput {
  dueDate: Date;
  balanceMinor: bigint;
}

export interface AgingBuckets {
  d0_30: bigint;
  d31_60: bigint;
  d61_90: bigint;
  d90plus: bigint;
}

/** Whole days past the due date (0 when not yet due). */
export const daysPastDue = (dueDate: Date, today: Date): number =>
  Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / DAY_MS));

/**
 * Open balances by age of their invoice due date: 0–30 days (incl. not yet
 * due), 31–60, 61–90 and more than 90 days.
 */
export function agingBuckets(
  invoices: readonly AgingInput[],
  today: Date,
): AgingBuckets {
  const buckets: AgingBuckets = {
    d0_30: 0n,
    d31_60: 0n,
    d61_90: 0n,
    d90plus: 0n,
  };
  for (const invoice of invoices) {
    if (invoice.balanceMinor <= 0n) continue;
    const days = daysPastDue(invoice.dueDate, today);
    const key: keyof AgingBuckets =
      days <= 30
        ? 'd0_30'
        : days <= 60
          ? 'd31_60'
          : days <= 90
            ? 'd61_90'
            : 'd90plus';
    buckets[key] += invoice.balanceMinor;
  }
  return buckets;
}

/** Days the oldest unpaid due date is behind today (0 when nothing is overdue). */
export function oldestOverdueDays(
  invoices: readonly AgingInput[],
  today: Date,
): number {
  return invoices
    .filter((invoice) => invoice.balanceMinor > 0n)
    .reduce(
      (max, invoice) => Math.max(max, daysPastDue(invoice.dueDate, today)),
      0,
    );
}
