import { toIsoDate } from "@/lib/dates";

/** "YYYY-MM-DD" as a local date (school-local, not UTC midnight). */
export function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function mondayOf(date: Date): string {
  const offset = (date.getDay() + 6) % 7;
  return toIsoDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() - offset));
}

export function shiftWeek(weekOf: string, weeks: number): string {
  const date = parseIsoDate(weekOf);
  return toIsoDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + weeks * 7));
}

/** ISO date of an ISO weekday (1 = Monday) within the week starting on `weekOf`. */
export function dateOfDay(weekOf: string, day: number): string {
  const date = parseIsoDate(weekOf);
  return toIsoDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + day - 1));
}

const SHORT = new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short" });
const LONG = new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short", year: "numeric" });

export function shortDate(iso: string): string {
  return SHORT.format(parseIsoDate(iso));
}

export function weekLabel(weekOf: string): string {
  return `${shortDate(weekOf)} – ${LONG.format(parseIsoDate(dateOfDay(weekOf, 7)))}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}
