import { parseComponents } from '../structures/current-structure';
import type { AdjustmentKind, PayComponent } from './payroll-calc';

export interface DetailAdjustment {
  id: string;
  kind: AdjustmentKind;
  amountMinor: number;
  reason: string;
}

/**
 * `PayrollLine.detail` JSON (the dev seed writes the same shape):
 * components as calculated, so payslips never depend on later edits.
 */
export interface LineDetail {
  allowances: PayComponent[];
  deductions: PayComponent[];
  adjustments: DetailAdjustment[];
  unpaidHalfDays: number;
  grossMinor: number;
  /** Present only when net was clamped at zero. */
  uncappedNetMinor?: number;
}

const KINDS = new Set(['BONUS', 'DEDUCTION', 'ADVANCE', 'ARREAR']);

function parseAdjustments(value: unknown): DetailAdjustment[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item: unknown) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as Record<string, unknown>;
    const amount = Number(row.amountMinor);
    if (!KINDS.has(String(row.kind)) || !Number.isSafeInteger(amount))
      return [];
    return [
      {
        id: typeof row.id === 'string' ? row.id : '',
        kind: row.kind as AdjustmentKind,
        amountMinor: amount,
        reason: typeof row.reason === 'string' ? row.reason : '',
      },
    ];
  });
}

/** Tolerant read of stored line detail. */
export function parseLineDetail(value: unknown): LineDetail {
  const raw = (value && typeof value === 'object' ? value : {}) as Record<
    string,
    unknown
  >;
  const uncapped = Number(raw.uncappedNetMinor);
  return {
    allowances: parseComponents(raw.allowances),
    deductions: parseComponents(raw.deductions),
    adjustments: parseAdjustments(raw.adjustments),
    unpaidHalfDays: Number(raw.unpaidHalfDays) || 0,
    grossMinor: Number(raw.grossMinor) || 0,
    ...(Number.isSafeInteger(uncapped) ? { uncappedNetMinor: uncapped } : {}),
  };
}
