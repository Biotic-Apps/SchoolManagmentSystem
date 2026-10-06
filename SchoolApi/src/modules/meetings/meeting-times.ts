import { parseDate } from '../../core/common/dates';
import { invalid } from '../../core/common/errors/errors';
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
