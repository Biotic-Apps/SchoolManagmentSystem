/** Staff leave relevant to payroll (approved only), dates as `YYYY-MM-DD`. */
export interface LeaveSpan {
  from: string;
  to: string;
  unpaid: boolean;
}

export type DayStatus =
  'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'HALF_DAY' | undefined;

/** Day counts of one staff member over the working days of a month. */
export interface AttendanceTally {
  workingDays: number;
  present: number;
  late: number;
  absent: number;
  halfDays: number;
  /** Approved paid leave, or a LEAVE mark: never deducted. */
  paidLeave: number;
  /** Approved UNPAID leave: deducted like an absence. */
  unpaidLeave: number;
  /** Days nobody marked: not deducted. */
  unmarked: number;
}

/** Late rule: every `latesPerDeduction` lates cost `lateDeductionDays` days (0 = off). */
export interface LateRule {
  latesPerDeduction: number;
  lateDeductionDays: number;
}

const covers = (span: LeaveSpan, day: string) =>
  span.from <= day && span.to >= day;

/**
 * Approved leave wins over the attendance mark: an UNPAID leave counts as
 * unpaid leave, any other approved leave as paid leave. Otherwise the mark
 * decides; unmarked days are never deducted.
 */
export function tallyAttendance(
  workingDays: string[],
  leaves: LeaveSpan[],
  attendance: ReadonlyMap<string, DayStatus>,
): AttendanceTally {
  const tally: AttendanceTally = {
    workingDays: workingDays.length,
    present: 0,
    late: 0,
    absent: 0,
    halfDays: 0,
    paidLeave: 0,
    unpaidLeave: 0,
    unmarked: 0,
  };
  for (const day of workingDays) {
    const onLeave = leaves.filter((span) => covers(span, day));
    if (onLeave.some((span) => span.unpaid)) tally.unpaidLeave += 1;
    else if (onLeave.length > 0) tally.paidLeave += 1;
    else {
      const status = attendance.get(day);
      if (status === 'PRESENT') tally.present += 1;
      else if (status === 'LATE') tally.late += 1;
      else if (status === 'ABSENT') tally.absent += 1;
      else if (status === 'HALF_DAY') tally.halfDays += 1;
      else if (status === 'LEAVE') tally.paidLeave += 1;
      else tally.unmarked += 1;
    }
  }
  return tally;
}

/** Absent and unpaid-leave days count in full, half days as half (in half days). */
export const absenceHalfDays = (tally: AttendanceTally): number =>
  2 * (tally.absent + tally.unpaidLeave) + tally.halfDays;

/** Late-rule deduction in half days, e.g. 7 lates at "3 lates = 1 day" → 4. */
export function lateHalfDays(lates: number, rule: LateRule): number {
  if (rule.latesPerDeduction <= 0 || rule.lateDeductionDays <= 0) return 0;
  const blocks = Math.floor(lates / rule.latesPerDeduction);
  return blocks * Math.round(rule.lateDeductionDays * 2);
}

/** Unpaid absence in half days (absent, unpaid leave, half days). */
export function unpaidHalfDays(
  workingDays: string[],
  leaves: LeaveSpan[],
  attendance: ReadonlyMap<string, DayStatus>,
): number {
  return absenceHalfDays(tallyAttendance(workingDays, leaves, attendance));
}
