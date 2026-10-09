import { parseComponents } from '../structures/current-structure';
import type { AdjustmentKind, PayComponent, PerDayBase } from './payroll-calc';

export interface DetailAdjustment {
  id: string;
  kind: AdjustmentKind;
  amountMinor: number;
  reason: string;
}

/** Day counts and the attendance deduction of one line. */
export interface DetailAttendance {
  /** Working days on the school calendar. */
  calendarDays: number;
  /** Days the salary is divided by (calendar or the fixed setting). */
  payDays: number;
  present: number;
  late: number;
  absent: number;
  halfDays: number;
  paidLeave: number;
  unpaidLeave: number;
  unmarked: number;
  perDayBase: PerDayBase;
  perDayMinor: number;
  absenceHalfDays: number;
  absenceDeductionMinor: number;
  latesPerDeduction: number;
  lateDeductionDays: number;
  lateHalfDays: number;
  lateDeductionMinor: number;
}

/** Approved overtime paid on the line. */
export interface DetailOvertime {
  minutes: number;
  hourlyRateMinor: number;
  /** Multiplier of the school rule; null when the structure fixes the rate. */
  multiplier: number | null;
  dailyHours: number;
  amountMinor: number;
  entryIds: string[];
  /** Overtime still waiting for approval (not paid). */
  pendingMinutes: number;
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
  /** Lines calculated before the attendance rules have none. */
  attendance?: DetailAttendance;
  overtime?: DetailOvertime;
}

const KINDS = new Set(['BONUS', 'DEDUCTION', 'ADVANCE', 'ARREAR', 'FINE']);

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

const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

/** Tolerant read of stored line detail. */
export function parseLineDetail(value: unknown): LineDetail {
  const raw = isObject(value) ? value : {};
  const uncapped = Number(raw.uncappedNetMinor);
  return {
    allowances: parseComponents(raw.allowances),
    deductions: parseComponents(raw.deductions),
    adjustments: parseAdjustments(raw.adjustments),
    unpaidHalfDays: Number(raw.unpaidHalfDays) || 0,
    grossMinor: Number(raw.grossMinor) || 0,
    ...(Number.isSafeInteger(uncapped) ? { uncappedNetMinor: uncapped } : {}),
    ...(isObject(raw.attendance)
      ? { attendance: raw.attendance as unknown as DetailAttendance }
      : {}),
    ...(isObject(raw.overtime)
      ? { overtime: raw.overtime as unknown as DetailOvertime }
      : {}),
  };
}
