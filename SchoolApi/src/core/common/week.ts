import { parseDate } from './dates';
import { schoolDate } from './school-time';

const DAY_MS = 86_400_000;

/** ISO weekday 1=Mon..7=Sun of a UTC date. */
export function isoWeekday(date: Date): number {
  const day = date.getUTCDay();
  return day === 0 ? 7 : day;
}

/** The seven dates (Mon..Sun) of the week containing `weekOf` (default today). */
export function weekDates(weekOf?: string, today = new Date()): Date[] {
  const anchor = parseDate(weekOf ?? schoolDate(today));
  const monday = anchor.getTime() - (isoWeekday(anchor) - 1) * DAY_MS;
  return Array.from({ length: 7 }, (_, i) => new Date(monday + i * DAY_MS));
}

/** Today's date in the school's time zone (as a UTC-midnight Date, like Postgres `date`). */
export function today(): Date {
  return parseDate(schoolDate());
}
