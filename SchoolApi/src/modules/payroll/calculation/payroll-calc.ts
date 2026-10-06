import { mulDivRound, sumMinor, ZERO } from '../../finance-core/money';

/** Structure component (allowance or deduction) as stored in JSON. */
export interface PayComponent {
  name: string;
  amountMinor: number;
}

export type AdjustmentKind = 'BONUS' | 'DEDUCTION' | 'ADVANCE' | 'ARREAR';

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
  workingDays: number;
  /** Unpaid absence in half days (1 = half day, 2 = full day). */
  unpaidHalfDays: number;
  adjustments: AdjustmentInput[];
}

export interface LineResult {
  basicMinor: bigint;
  allowancesMinor: bigint;
  deductionsMinor: bigint;
  grossMinor: bigint;
  leaveDeductionMinor: bigint;
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
 * Leave deduction = basic × halfDays / (2 × workingDays), half-up.
 * Unpaid days never exceed the working days of the month.
 */
export function leaveDeduction(
  basicMinor: bigint,
  unpaidHalfDays: number,
  workingDays: number,
): bigint {
  if (workingDays <= 0 || unpaidHalfDays <= 0) return ZERO;
  const halfDays = Math.min(unpaidHalfDays, workingDays * 2);
  return mulDivRound(basicMinor, BigInt(halfDays), BigInt(workingDays * 2));
}

/** One payroll line: basic + allowances − deductions − leave ± adjustments. */
export function calculateLine(input: LineInput): LineResult {
  const allowancesMinor = componentTotal(input.allowances);
  const deductionsMinor = componentTotal(input.deductions);
  const grossMinor = input.basicMinor + allowancesMinor;
  const leaveDeductionMinor = leaveDeduction(
    input.basicMinor,
    input.unpaidHalfDays,
    input.workingDays,
  );
  const adjustmentsMinor = sumMinor(
    input.adjustments.map((a) => adjustmentSign(a.kind) * a.amountMinor),
  );
  const uncappedNetMinor =
    grossMinor - deductionsMinor - leaveDeductionMinor + adjustmentsMinor;
  return {
    basicMinor: input.basicMinor,
    allowancesMinor,
    deductionsMinor,
    grossMinor,
    leaveDeductionMinor,
    adjustmentsMinor,
    netMinor: uncappedNetMinor < ZERO ? ZERO : uncappedNetMinor,
    uncappedNetMinor,
  };
}
