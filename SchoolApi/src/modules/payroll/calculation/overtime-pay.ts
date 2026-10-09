import { mulDivRound, ZERO } from '../../finance-core/money';

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Minutes worked after the staff leave time. Nothing counts until the
 * check-out is more than `graceMinutes` late; then the whole stretch counts.
 */
export function overtimeMinutes(
  checkOut: string | null | undefined,
  leavesAt: string,
  graceMinutes: number,
): number {
  if (!checkOut) return 0;
  const extra = toMinutes(checkOut) - toMinutes(leavesAt);
  return extra > Math.max(0, graceMinutes) ? extra : 0;
}

/** Paid hours of a day from the branch staff arrive → leave times. */
export function dailyHoursFromTimings(
  arrivesAt: string,
  leavesAt: string,
): number {
  const minutes = toMinutes(leavesAt) - toMinutes(arrivesAt);
  return minutes > 0 ? minutes / 60 : 0;
}

export interface HourlyRateInput {
  basicMinor: bigint;
  workingDays: number;
  dailyHours: number;
  multiplier: number;
  /** A fixed rate on the salary structure wins over the school rule. */
  fixedRateMinor?: bigint | null;
}

/** Overtime pay for one hour: basic ÷ (working days × daily hours) × multiplier. */
export function hourlyRateMinor(input: HourlyRateInput): bigint {
  if (input.fixedRateMinor != null && input.fixedRateMinor > ZERO) {
    return input.fixedRateMinor;
  }
  const hours100 = Math.round(input.dailyHours * 100);
  const multiplier100 = Math.round(input.multiplier * 100);
  if (input.workingDays <= 0 || hours100 <= 0 || multiplier100 <= 0) {
    return ZERO;
  }
  return mulDivRound(
    input.basicMinor,
    BigInt(multiplier100),
    BigInt(input.workingDays * hours100),
  );
}

/** Pay for `minutes` of overtime at `rateMinor` per hour, half-up. */
export const overtimePayMinor = (minutes: number, rateMinor: bigint): bigint =>
  minutes > 0 && rateMinor > ZERO
    ? mulDivRound(rateMinor, BigInt(minutes), 60n)
    : ZERO;
