import { schoolDateTime, schoolTime } from '../../core/common/school-time';

/** School wall time `HH:mm` (branch times are stored 24-hour). */
export function localTime(now = new Date()): string {
  return schoolTime(now);
}

/** `from <= time < to`; a window like 22:00-06:00 wraps past midnight. */
export function isWithinHours(time: string, from: string, to: string): boolean {
  if (from === to) return true;
  return from < to ? time >= from && time < to : time >= from || time < to;
}

/** Combines a `YYYY-MM-DD` date and `HH:mm` time in the school's time zone. */
export function localDateTime(date: string, time: string): Date {
  return schoolDateTime(date, time);
}
