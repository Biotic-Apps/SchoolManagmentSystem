import type { FeeFrequency } from '../../../generated/prisma/client';

/** One billable plan item (money as BigInt minor units). */
export interface PlanItem {
  feeHeadId: string;
  amountMinor: bigint;
  frequency: FeeFrequency;
  dueDay: number;
}

export interface LateFeeRule {
  amountMinor: number;
  afterDays: number;
}

/**
 * `FeePlan.approvedSnapshot` JSON (shared with the dev seed):
 * `{ revision, items: [{ feeHeadId, amountMinor, frequency, dueDay }], lateFee }`.
 */
export interface PlanSnapshotJson {
  revision: number;
  items: {
    feeHeadId: string;
    amountMinor: number;
    frequency: FeeFrequency;
    dueDay: number;
  }[];
  lateFee: LateFeeRule | null;
}

export interface PlanSnapshot {
  revision: number;
  items: PlanItem[];
  lateFee: LateFeeRule | null;
}

const FREQUENCIES = new Set<string>([
  'MONTHLY',
  'QUARTERLY',
  'TERM',
  'YEARLY',
  'ONCE',
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** `{ amountMinor, afterDays }` with whole non-negative numbers, else null. */
export function parseLateFeeRule(value: unknown): LateFeeRule | null {
  if (!isRecord(value)) return null;
  const { amountMinor, afterDays } = value;
  if (
    typeof amountMinor !== 'number' ||
    typeof afterDays !== 'number' ||
    !Number.isSafeInteger(amountMinor) ||
    !Number.isSafeInteger(afterDays) ||
    amountMinor <= 0 ||
    afterDays < 0
  ) {
    return null;
  }
  return { amountMinor, afterDays };
}

/** Reads a stored snapshot; malformed items are dropped (never guessed). */
export function parseSnapshot(value: unknown): PlanSnapshot | null {
  if (!isRecord(value) || !Array.isArray(value.items)) return null;
  const items: PlanItem[] = [];
  for (const raw of value.items as unknown[]) {
    if (!isRecord(raw)) continue;
    const { feeHeadId, amountMinor, frequency, dueDay } = raw;
    if (
      typeof feeHeadId !== 'string' ||
      typeof amountMinor !== 'number' ||
      !Number.isSafeInteger(amountMinor) ||
      amountMinor < 0 ||
      typeof frequency !== 'string' ||
      !FREQUENCIES.has(frequency) ||
      typeof dueDay !== 'number'
    ) {
      continue;
    }
    items.push({
      feeHeadId,
      amountMinor: BigInt(amountMinor),
      frequency: frequency as FeeFrequency,
      dueDay: Math.min(31, Math.max(1, Math.trunc(dueDay))),
    });
  }
  return {
    revision: typeof value.revision === 'number' ? value.revision : 0,
    items,
    lateFee: parseLateFeeRule(value.lateFee),
  };
}

export function toSnapshotJson(
  revision: number,
  items: PlanItem[],
  lateFee: LateFeeRule | null,
): PlanSnapshotJson {
  return {
    revision,
    items: items.map((item) => ({
      feeHeadId: item.feeHeadId,
      amountMinor: Number(item.amountMinor),
      frequency: item.frequency,
      dueDay: item.dueDay,
    })),
    lateFee,
  };
}
