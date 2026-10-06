/**
 * Marks and percents are stored as DECIMAL(…, 2). All arithmetic runs on
 * integer hundredths so no float ever reaches a stored value.
 */

/** `45.5` / `"45.50"` / Prisma Decimal → 4550. */
export function toHundredths(value: { toString(): string } | number): number {
  if (typeof value === 'number') return Math.round(value * 100);
  const text = value.toString().trim();
  const negative = text.startsWith('-');
  const [whole, fraction = ''] = (negative ? text.slice(1) : text).split('.');
  const cents =
    Number(whole || '0') * 100 + Number(fraction.padEnd(2, '0').slice(0, 2));
  return negative ? -cents : cents;
}

/** 4550 → `"45.50"` (for DECIMAL columns). */
export function formatHundredths(value: number): string {
  const negative = value < 0;
  const abs = Math.abs(value);
  const text = `${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
  return negative ? `-${text}` : text;
}

/** 4550 → 45.5 (JSON output only). */
export const hundredthsToNumber = (value: number): number => value / 100;

/** Decimal column → JSON number (exact to 2 dp). */
export const decimalToNumber = (
  value: { toString(): string } | null | undefined,
): number | null =>
  value === null || value === undefined
    ? null
    : hundredthsToNumber(toHundredths(value));

/** Integer division rounded half up (non-negative inputs). */
export function divRound(numerator: number, denominator: number): number {
  if (denominator <= 0) throw new Error('denominator must be positive');
  return Math.floor((numerator * 2 + denominator) / (denominator * 2));
}
