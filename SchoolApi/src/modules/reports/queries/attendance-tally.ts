import { percent, type ReportColumn } from '../report-table';

export type Mark = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'HALF_DAY';

export interface Tally {
  present: number;
  absent: number;
  late: number;
  leave: number;
  halfDay: number;
  marked: number;
  percent: number | null;
}

export const TALLY_COLUMNS: ReportColumn[] = [
  { key: 'present', header: 'Present', kind: 'int' },
  { key: 'absent', header: 'Absent', kind: 'int' },
  { key: 'late', header: 'Late', kind: 'int' },
  { key: 'leave', header: 'Leave', kind: 'int' },
  { key: 'halfDay', header: 'Half day', kind: 'int' },
  { key: 'marked', header: 'Marked days', kind: 'int' },
  { key: 'percent', header: 'Attendance %', kind: 'percent' },
];

const FIELD: Record<Mark, keyof Omit<Tally, 'marked' | 'percent'>> = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  LEAVE: 'leave',
  HALF_DAY: 'halfDay',
};

/**
 * Same rule as the attendance summary: (present + late + ½ half day) over
 * marked days that are not leave; `null` when nothing counts.
 */
export function tally(marks: readonly Mark[]): Tally {
  const t: Tally = {
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    halfDay: 0,
    marked: marks.length,
    percent: null,
  };
  for (const mark of marks) t[FIELD[mark]] += 1;
  t.percent = percent(
    t.present * 2 + t.late * 2 + t.halfDay,
    (t.marked - t.leave) * 2,
  );
  return t;
}
