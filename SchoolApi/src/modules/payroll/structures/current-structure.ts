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

/**
 * Error message when fixed deductions exceed gross pay (basic + allowances):
 * net salary would be negative every month. Null when the structure is valid.
 */
export function deductionsError(structure: {
  basicMinor: number;
  allowances: readonly PayComponent[];
  deductions: readonly PayComponent[];
}): string | null {
  const total = (items: readonly PayComponent[]) =>
    items.reduce((sum, item) => sum + BigInt(item.amountMinor), 0n);
  const gross = BigInt(structure.basicMinor) + total(structure.allowances);
  const deductions = total(structure.deductions);
  return deductions > gross
    ? 'Deductions cannot be more than the gross salary (basic + allowances). Record a large advance recovery as monthly payroll adjustments instead.'
    : null;
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
