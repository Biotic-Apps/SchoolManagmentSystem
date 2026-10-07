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

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "2026-04-01" → "1 Apr 2026" (school-local, no time zone shift). */
export function formatDayMonthYear(iso: string | null | undefined): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  if (!match) return "";
  const month = MONTHS[Number(match[2]) - 1];
  return `${Number(match[3])} ${month.charAt(0).toUpperCase()}${month.slice(1)} ${match[1]}`;
}

function validIso(year: number, month: number, day: number): string | null {
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return toIsoDate(date);
}

/** Reads "2026-04-01", "1/4/2026" (day first) or "1 Apr 2026"; returns ISO or null. */
export function parseDateText(text: string): string | null {
  const value = text.trim().toLowerCase();
  let match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);
  if (match) return validIso(Number(match[1]), Number(match[2]), Number(match[3]));
  match = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(value);
  if (match) return validIso(Number(match[3]), Number(match[2]), Number(match[1]));
  match = /^(\d{1,2})\s+([a-z]{3})[a-z]*,?\s+(\d{4})$/.exec(value);
  if (match && MONTHS.includes(match[2])) return validIso(Number(match[3]), MONTHS.indexOf(match[2]) + 1, Number(match[1]));
  return null;
}

/** Month view that contains an ISO date (or today). */
export function monthOf(iso: string | null | undefined): MonthRef {
  const match = /^(\d{4})-(\d{2})/.exec(iso ?? "");
  return match ? { year: Number(match[1]), month: Number(match[2]) - 1 } : currentMonth();
}
