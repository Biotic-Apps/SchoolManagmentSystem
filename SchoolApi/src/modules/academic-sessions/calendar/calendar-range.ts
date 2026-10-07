import { parseDate } from '../../../core/common/dates';
import { invalid } from '../../../core/common/errors/errors';

const DAY_MS = 86_400_000;
/** Window used when the caller gives no `to`. */
export const DEFAULT_CALENDAR_DAYS = 90;
export const MAX_CALENDAR_DAYS = 366;

export interface CalendarRange {
  from: Date;
  to: Date;
}

/** `from` defaults to the school's today, `to` to `from` + 90 days; at most 366 days. */
export function resolveCalendarRange(
  today: string,
  from?: string,
  to?: string,
): CalendarRange {
  const start = parseDate(from ?? today);
  const end = to
    ? parseDate(to)
    : new Date(start.getTime() + DEFAULT_CALENDAR_DAYS * DAY_MS);
  if (end < start) throw invalid('to must be on or after from');
  if ((end.getTime() - start.getTime()) / DAY_MS > MAX_CALENDAR_DAYS)
    throw invalid(`Range is limited to ${MAX_CALENDAR_DAYS} days`);
  return { from: start, to: end };
}
