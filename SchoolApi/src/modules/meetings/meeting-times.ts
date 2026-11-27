import { formatDate, parseDate } from '../../core/common/dates';
import { invalid } from '../../core/common/errors/errors';
import { schoolDateTime } from '../../core/common/school-time';
import { today } from '../../core/common/week';

/** Start before end and not on a past date. */
export function assertMeetingTimes(
  date: string,
  startTime: string,
  endTime: string,
): Date {
  if (startTime >= endTime) {
    throw invalid('startTime must be before endTime', { date, startTime });
  }
  const day = parseDate(date);
  if (day < today()) throw invalid('Date is in the past', { date });
  return day;
}

/** `[a, b)` and `[c, d)` overlap. */
export const overlaps = (
  a: { startTime: string; endTime: string },
  b: { startTime: string; endTime: string },
): boolean => a.startTime < b.endTime && b.startTime < a.endTime;

/** `HH:mm` plus [minutes], capped at 23:59. */
export function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = Math.min(h * 60 + m + minutes, 23 * 60 + 59);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

/** A meeting can only be completed or marked missed once it has started (school time). */
export function assertMeetingStarted(
  meeting: { date: Date; startTime: string },
  now = new Date(),
): void {
  const start = schoolDateTime(formatDate(meeting.date), meeting.startTime);
  if (now < start) throw invalid('The meeting has not started yet');
}
