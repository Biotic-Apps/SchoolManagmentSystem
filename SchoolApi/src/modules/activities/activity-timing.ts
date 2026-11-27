import { formatDate, parseDate } from '../../core/common/dates';
import { conflict, invalid } from '../../core/common/errors/errors';
import { schoolDate } from '../../core/common/school-time';
import type { ActivityStatusTarget } from './dto/activity-input.dto';

/**
 * Activity dates: a new activity cannot start on a day already past, the
 * end is not before the start, and a consent deadline falls on or before
 * the (school-clock) start date.
 */
export function assertActivityTimes(
  startAt: Date,
  endAt: Date,
  consentDeadline: Date | null,
  opts: { isNew: boolean; now?: Date },
): void {
  const now = opts.now ?? new Date();
  if (endAt.getTime() < startAt.getTime())
    throw invalid('endAt must not be before startAt');
  const startDay = parseDate(schoolDate(startAt));
  if (opts.isNew && startDay < parseDate(schoolDate(now)))
    throw invalid('startAt cannot be on a day that has already passed');
  if (consentDeadline && consentDeadline > startDay)
    throw invalid(
      `consentDeadline must be on or before the start date (${formatDate(startDay)})`,
    );
}

/** ONGOING / COMPLETED only once the activity has started. */
export function assertStatusTiming(
  to: ActivityStatusTarget,
  startAt: Date,
  now = new Date(),
): void {
  if ((to === 'ONGOING' || to === 'COMPLETED') && now < startAt)
    throw conflict(
      `The activity starts on ${schoolDate(startAt)}; it cannot be ${to.toLowerCase()} before then`,
    );
}
