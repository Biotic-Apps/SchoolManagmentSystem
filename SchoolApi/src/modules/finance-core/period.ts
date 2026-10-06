import { invalid } from '../../core/common/errors/errors';

/** Billing/payroll months as `YYYY-MM` strings (school calendar, no time zone). */
const PERIOD = /^(\d{4})-(0[1-9]|1[0-2])$/;

export const isPeriod = (value: string): boolean => PERIOD.test(value);

export function assertPeriod(value: string, field = 'period'): string {
  if (!isPeriod(value)) throw invalid(`${field} must be YYYY-MM`);
  return value;
}

/** `YYYY-MM` of a date-only value (UTC midnight). */
export const periodOf = (date: Date): string => date.toISOString().slice(0, 7);

export function addMonths(period: string, months: number): string {
  const [y, m] = period.split('-').map(Number);
  const index = y * 12 + (m - 1) + months;
  const year = Math.floor(index / 12);
  return `${year}-${String((index % 12) + 1).padStart(2, '0')}`;
}

/** Months from `a` to `b` (b − a). */
export function monthsBetween(a: string, b: string): number {
  const [ya, ma] = a.split('-').map(Number);
  const [yb, mb] = b.split('-').map(Number);
  return yb * 12 + mb - (ya * 12 + ma);
}

export function daysInPeriod(period: string): number {
  const [y, m] = period.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** Day `day` of the month, clamped to its last day (due day 31 in February → 28/29). */
export function dayInPeriod(period: string, day: number): Date {
  const [y, m] = period.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, Math.min(day, daysInPeriod(period))));
}

export const periodStart = (period: string): Date => dayInPeriod(period, 1);

export const periodEnd = (period: string): Date =>
  dayInPeriod(period, daysInPeriod(period));

/** Inclusive range check with an open end (`to` null). */
export const periodInRange = (
  period: string,
  from: string,
  to: string | null,
): boolean => period >= from && (to === null || period <= to);
