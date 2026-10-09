import { mulDivRound, sumMinor, ZERO } from '../../finance-core/money';

/** Structure component (allowance or deduction) as stored in JSON. */
export interface PayComponent {
  name: string;
  amountMinor: number;
}

export type AdjustmentKind =
  'BONUS' | 'DEDUCTION' | 'ADVANCE' | 'ARREAR' | 'FINE';

/** What one day of salary is worth: gross (basic + allowances) or basic only. */
export type PerDayBase = 'GROSS' | 'BASIC';

export interface AdjustmentInput {
  id: string;
  kind: AdjustmentKind;
  amountMinor: bigint;
  reason: string;
}

export interface LineInput {
  basicMinor: bigint;
  allowances: PayComponent[];
  deductions: PayComponent[];
  /** Days the monthly salary is divided by. */
  workingDays: number;
  /** Unpaid absence in half days (1 = half day, 2 = full day). */
  unpaidHalfDays: number;
  /** Late-rule deduction in half days. */
  lateHalfDays?: number;
  /** Default GROSS. */
  perDayBase?: PerDayBase;
  /** Approved overtime pay. */
  overtimeMinor?: bigint;
  adjustments: AdjustmentInput[];
}

export interface LineResult {
  basicMinor: bigint;
  allowancesMinor: bigint;
  deductionsMinor: bigint;
  grossMinor: bigint;
  /** Salary of one day (per-day base ÷ working days), for display. */
  perDayMinor: bigint;
  absenceDeductionMinor: bigint;
  lateDeductionMinor: bigint;
  /** absence + late. */
  leaveDeductionMinor: bigint;
  overtimeMinor: bigint;
  /** Signed: BONUS/ARREAR add, DEDUCTION/ADVANCE subtract. */
  adjustmentsMinor: bigint;
  /** Never below zero. */
  netMinor: bigint;
  /** Net before clamping (negative when deductions exceed pay). */
  uncappedNetMinor: bigint;
}

/** Sign of an adjustment kind: additions are +1, recoveries −1. */
export const adjustmentSign = (kind: AdjustmentKind): 1n | -1n =>
  kind === 'BONUS' || kind === 'ARREAR' ? 1n : -1n;

const componentTotal = (items: PayComponent[]): bigint =>
  sumMinor(items.map((item) => BigInt(item.amountMinor)));

/**
 * Leave deduction = base × halfDays / (2 × workingDays), half-up.
 * Unpaid days never exceed the working days of the month.
 */
export function leaveDeduction(
  baseMinor: bigint,
  unpaidHalfDays: number,
  workingDays: number,
): bigint {
  if (workingDays <= 0 || unpaidHalfDays <= 0) return ZERO;
  const halfDays = Math.min(unpaidHalfDays, workingDays * 2);
  return mulDivRound(baseMinor, BigInt(halfDays), BigInt(workingDays * 2));
}

/**
 * One payroll line: basic + allowances + overtime − deductions − absence −
 * late rule ± adjustments. Absence and lates together never exceed the month.
 */
export function calculateLine(input: LineInput): LineResult {
  const allowancesMinor = componentTotal(input.allowances);
  const deductionsMinor = componentTotal(input.deductions);
  const grossMinor = input.basicMinor + allowancesMinor;
  const base = input.perDayBase === 'BASIC' ? input.basicMinor : grossMinor;
  const absenceHalfDays = Math.max(0, input.unpaidHalfDays);
  const totalHalfDays = absenceHalfDays + Math.max(0, input.lateHalfDays ?? 0);
  const absenceDeductionMinor = leaveDeduction(
    base,
    absenceHalfDays,
    input.workingDays,
  );
  const leaveDeductionMinor = leaveDeduction(
    base,
    totalHalfDays,
    input.workingDays,
  );
  const overtimeMinor = input.overtimeMinor ?? ZERO;
  const adjustmentsMinor = sumMinor(
    input.adjustments.map((a) => adjustmentSign(a.kind) * a.amountMinor),
  );
  const uncappedNetMinor =
    grossMinor +
    overtimeMinor -
    deductionsMinor -
    leaveDeductionMinor +
    adjustmentsMinor;
  return {
    basicMinor: input.basicMinor,
    allowancesMinor,
    deductionsMinor,
    grossMinor,
    perDayMinor:
      input.workingDays > 0 ? leaveDeduction(base, 2, input.workingDays) : ZERO,
    absenceDeductionMinor,
    lateDeductionMinor: leaveDeductionMinor - absenceDeductionMinor,
    leaveDeductionMinor,
    overtimeMinor,
    adjustmentsMinor,
    netMinor: uncappedNetMinor < ZERO ? ZERO : uncappedNetMinor,
    uncappedNetMinor,
  };
}
