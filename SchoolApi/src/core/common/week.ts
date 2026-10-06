import { formatDate, parseDate } from './dates';

const DAY_MS = 86_400_000;

/** ISO weekday 1=Mon..7=Sun of a UTC date. */
export function isoWeekday(date: Date): number {
  const day = date.getUTCDay();
  return day === 0 ? 7 : day;
}

/** The seven dates (Mon..Sun) of the week containing `weekOf` (default today). */
export function weekDates(weekOf?: string, today = new Date()): Date[] {
  const anchor = weekOf ? parseDate(weekOf) : parseDate(formatDate(today));
  const monday = anchor.getTime() - (isoWeekday(anchor) - 1) * DAY_MS;
  return Array.from({ length: 7 }, (_, i) => new Date(monday + i * DAY_MS));
}

export function today(): Date {
  return parseDate(formatDate(new Date()));
}
