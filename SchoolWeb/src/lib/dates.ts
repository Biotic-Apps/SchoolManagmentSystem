export interface MonthRef {
  year: number;
  month: number; // 0-11
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function currentMonth(): MonthRef {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

export function shiftMonth({ year, month }: MonthRef, delta: number): MonthRef {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function monthBounds({ year, month }: MonthRef): { from: string; to: string } {
  return { from: toIsoDate(new Date(year, month, 1)), to: toIsoDate(new Date(year, month + 1, 0)) };
}

export function monthLabel({ year, month }: MonthRef): string {
  return new Intl.DateTimeFormat("en-PK", { month: "long", year: "numeric" }).format(new Date(year, month, 1));
}

/** 6×7 grid of ISO dates starting on Monday; days outside the month are flagged. */
export function monthGrid({ year, month }: MonthRef): { date: string; day: number; inMonth: boolean }[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(year, month, 1 - offset + index);
    return { date: toIsoDate(date), day: date.getDate(), inMonth: date.getMonth() === month };
  });
}

export function isWithin(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

/** Shifts a "YYYY-MM-DD" date by whole days (school-local). */
export function addDays(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  return toIsoDate(new Date(year, month - 1, day + days));
}
