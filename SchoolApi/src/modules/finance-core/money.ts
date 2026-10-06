/**
 * Money helpers. Amounts are BigInt minor units (paisa); never floats.
 * API DTOs carry `amountMinor` as a JSON number (safe up to 2^53).
 */
export const ZERO = 0n;

export function toMinor(value: number): bigint {
  if (!Number.isSafeInteger(value)) {
    throw new Error('Amount must be a whole number of minor units');
  }
  return BigInt(value);
}

export const minorToNumber = (value: bigint | null | undefined): number =>
  value === null || value === undefined ? 0 : Number(value);

export const sumMinor = (values: readonly bigint[]): bigint =>
  values.reduce((total, value) => total + value, ZERO);

export const minBig = (a: bigint, b: bigint): bigint => (a < b ? a : b);
export const maxBig = (a: bigint, b: bigint): bigint => (a > b ? a : b);

/**
 * `amount × numerator / denominator` rounded half-up to whole minor units
 * (deterministic: integer arithmetic only). Inputs must be non-negative.
 */
export function mulDivRound(
  amount: bigint,
  numerator: bigint,
  denominator: bigint,
): bigint {
  if (denominator <= 0n) throw new Error('denominator must be positive');
  if (amount < 0n || numerator < 0n) {
    throw new Error('mulDivRound expects non-negative values');
  }
  return (amount * numerator * 2n + denominator) / (denominator * 2n);
}

/** Whole-percent share of an amount, rounded half-up to minor units. */
export const percentOf = (amount: bigint, percent: bigint | number): bigint =>
  mulDivRound(amount, BigInt(percent), 100n);

/** `12345` → `"PKR 123.45"` for documents (PKR has 2 minor digits). */
export function formatMinor(value: bigint | number, currency = 'PKR'): string {
  const v = BigInt(value);
  const sign = v < 0n ? '-' : '';
  const abs = v < 0n ? -v : v;
  const major = (abs / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const minor = (abs % 100n).toString().padStart(2, '0');
  return `${sign}${currency} ${major}.${minor}`;
}
