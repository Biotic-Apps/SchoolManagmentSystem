import type { AttendanceStatus } from '../../generated/prisma/client';

export interface Tally {
  present: number;
  absent: number;
  late: number;
  leave: number;
  halfDay: number;
  unmarked: number;
  percent: number | null;
}

/** Unmarked days never count as absent; leave is excluded from the percent. */
export function tally(statuses: (AttendanceStatus | null)[]): Tally {
  const t: Tally = {
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    halfDay: 0,
    unmarked: 0,
    percent: null,
  };
  for (const status of statuses) {
    if (status === null) t.unmarked++;
    else if (status === 'PRESENT') t.present++;
    else if (status === 'ABSENT') t.absent++;
    else if (status === 'LATE') t.late++;
    else if (status === 'LEAVE') t.leave++;
    else t.halfDay++;
  }
  const counted = t.present + t.absent + t.late + t.halfDay;
  if (counted > 0) {
    const attended = t.present + t.late + t.halfDay / 2;
    t.percent = Math.round((attended / counted) * 1000) / 10;
  }
  return t;
}
