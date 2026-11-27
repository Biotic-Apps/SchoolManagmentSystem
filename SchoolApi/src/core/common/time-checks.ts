import { formatDate } from './dates';
import { invalid } from './errors/errors';
import { schoolDate } from './school-time';

/** Allowed difference between a device clock and the server for "now" values. */
export const CLOCK_SKEW_MS = 5 * 60_000;

/** Rejects an instant later than now (with a few minutes of clock skew). */
export function assertNotFuture(
  at: Date,
  label: string,
  now = new Date(),
): void {
  if (at.getTime() > now.getTime() + CLOCK_SKEW_MS) {
    throw invalid(`${label} cannot be in the future`);
  }
}

/** Rejects a `YYYY-MM-DD` before today's school date (Asia/Karachi). */
export function assertNotPastDay(
  date: string,
  label: string,
  now = new Date(),
): void {
  if (date < schoolDate(now)) {
    throw invalid(`${label} cannot be in the past`);
  }
}

/** Whether `at` falls on the school day stored as `day` (a Postgres `date`). */
export function onSchoolDay(day: Date, at: Date): boolean {
  return formatDate(day) === schoolDate(at);
}
