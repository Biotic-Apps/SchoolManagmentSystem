import type {
  PaymentMethod,
  PaymentStatus,
} from '../../../generated/prisma/client';

export interface CollectedPayment {
  method: PaymentMethod;
  amountMinor: bigint;
  receivedById: string;
  status: PaymentStatus;
}

export interface Bucket {
  count: number;
  amountMinor: bigint;
}

export interface DailyTotals {
  count: number;
  totalMinor: bigint;
  cashMinor: bigint;
  byMethod: Map<PaymentMethod, Bucket>;
  byCashier: Map<string, Bucket>;
  /** Reversed payments of the day: shown apart, not in the totals. */
  reversed: Bucket;
}

const add = <K>(map: Map<K, Bucket>, key: K, amount: bigint) => {
  const bucket = map.get(key) ?? { count: 0, amountMinor: 0n };
  map.set(key, {
    count: bucket.count + 1,
    amountMinor: bucket.amountMinor + amount,
  });
};

/** Day totals per method and per cashier; reversed payments are kept out. */
export function dailyTotals(
  payments: readonly CollectedPayment[],
): DailyTotals {
  const totals: DailyTotals = {
    count: 0,
    totalMinor: 0n,
    cashMinor: 0n,
    byMethod: new Map(),
    byCashier: new Map(),
    reversed: { count: 0, amountMinor: 0n },
  };
  for (const payment of payments) {
    if (payment.status === 'REVERSED') {
      totals.reversed.count += 1;
      totals.reversed.amountMinor += payment.amountMinor;
      continue;
    }
    totals.count += 1;
    totals.totalMinor += payment.amountMinor;
    if (payment.method === 'CASH') totals.cashMinor += payment.amountMinor;
    add(totals.byMethod, payment.method, payment.amountMinor);
    add(totals.byCashier, payment.receivedById, payment.amountMinor);
  }
  return totals;
}

/** Counted − expected: negative = cash short, positive = cash over. */
export const cashDifference = (counted: bigint, expected: bigint): bigint =>
  counted - expected;

/** A closing with a difference must explain it. */
export const closingNoteRequired = (difference: bigint): boolean =>
  difference !== 0n;
