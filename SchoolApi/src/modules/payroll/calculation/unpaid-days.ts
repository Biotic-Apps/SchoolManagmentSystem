/** Staff leave relevant to payroll (approved only), dates as `YYYY-MM-DD`. */
export interface LeaveSpan {
  from: string;
  to: string;
  unpaid: boolean;
}

export type DayStatus =
  'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'HALF_DAY' | undefined;

const covers = (span: LeaveSpan, day: string) =>
  span.from <= day && span.to >= day;

/**
 * Unpaid absence of one staff member in half days over the working days of
 * the month: an approved UNPAID leave counts a full day; otherwise an
 * approved paid leave excuses the day; otherwise ABSENT counts a full day
 * and HALF_DAY half a day. Unmarked days are not deducted.
 */
export function unpaidHalfDays(
  workingDays: string[],
  leaves: LeaveSpan[],
  attendance: ReadonlyMap<string, DayStatus>,
): number {
  let halfDays = 0;
  for (const day of workingDays) {
    const onLeave = leaves.filter((span) => covers(span, day));
    if (onLeave.some((span) => span.unpaid)) {
      halfDays += 2;
      continue;
    }
    if (onLeave.length > 0) continue;
    const status = attendance.get(day);
    if (status === 'ABSENT') halfDays += 2;
    else if (status === 'HALF_DAY') halfDays += 1;
  }
  return halfDays;
}
