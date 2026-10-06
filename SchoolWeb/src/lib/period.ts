import { EMPTY_VALUE } from "./format";

// Billing / payroll months travel as "YYYY-MM".

const PERIOD = /^(\d{4})-(\d{2})$/;

export function currentPeriod(): string {
  const now = new Date();
  return toPeriod(now.getFullYear(), now.getMonth());
}

export function toPeriod(year: number, monthIndex: number): string {
  const date = new Date(year, monthIndex, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function shiftPeriod(period: string, delta: number): string {
  const match = PERIOD.exec(period);
  if (!match) return period;
  return toPeriod(Number(match[1]), Number(match[2]) - 1 + delta);
}

/** "2026-10" → "October 2026". */
export function formatPeriod(period: string | null | undefined): string {
  const match = period ? PERIOD.exec(period) : null;
  if (!match) return period || EMPTY_VALUE;
  return new Intl.DateTimeFormat("en-PK", { month: "long", year: "numeric" }).format(
    new Date(Number(match[1]), Number(match[2]) - 1, 1),
  );
}

export function isPeriod(value: string): boolean {
  return PERIOD.test(value);
}
