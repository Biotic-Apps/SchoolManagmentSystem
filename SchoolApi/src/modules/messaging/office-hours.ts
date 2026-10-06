import { isWithinHours, localTime } from '../school-day/clock';

export interface OfficeHours {
  from: string;
  to: string;
}

/** Outside the branch office hours a message arrives without a push. */
export function deliversSilently(now: Date, hours: OfficeHours): boolean {
  return !isWithinHours(localTime(now), hours.from, hours.to);
}
