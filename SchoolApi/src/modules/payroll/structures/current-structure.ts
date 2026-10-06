import type { PayComponent } from '../calculation/payroll-calc';

export interface StructureRef {
  effectiveFrom: string;
  createdAt: Date;
}

/** Newest first: later effectiveFrom, then later createdAt. */
export function sortStructures<T extends StructureRef>(rows: T[]): T[] {
  return [...rows].sort(
    (a, b) =>
      b.effectiveFrom.localeCompare(a.effectiveFrom) ||
      b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

/** The structure in force for `month`: latest effectiveFrom ≤ month (ties: newest row). */
export function structureFor<T extends StructureRef>(
  rows: T[],
  month: string,
): T | null {
  return sortStructures(rows).find((row) => row.effectiveFrom <= month) ?? null;
}

/** Tolerant read of the stored `[{ name, amountMinor }]` JSON. */
export function parseComponents(value: unknown): PayComponent[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item: unknown) => {
    if (!item || typeof item !== 'object') return [];
    const { name, amountMinor } = item as Record<string, unknown>;
    const amount = Number(amountMinor);
    if (!Number.isSafeInteger(amount)) return [];
    return [
      { name: typeof name === 'string' ? name : '', amountMinor: amount },
    ];
  });
}
