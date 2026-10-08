import { invalid } from '../../../core/common/errors/errors';
import type { PeriodDto } from '../dto/timetable.dto';

/** One bell row as stored (`day` 0 = default schedule, 1..7 = that weekday's own). */
export interface BellRow {
  day: number;
  index: number;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  label: string | null;
}

export type BellRowInput = Omit<BellRow, 'day' | 'label'> & {
  label?: string | null;
};

export const DAY_NAMES = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Rows of one day sorted by index; teaching rows get `number` = ordinal, labels only on breaks. */
export function numberPeriods(rows: readonly BellRowInput[]): PeriodDto[] {
  let n = 0;
  return [...rows]
    .sort((a, b) => a.index - b.index)
    .map((row) => ({
      index: row.index,
      number: row.isBreak ? null : ++n,
      startTime: row.startTime,
      endTime: row.endTime,
      isBreak: row.isBreak,
      label: row.isBreak ? row.label?.trim() || 'Break' : null,
    }));
}

/** A weekday uses its own rows when it has any, else the default (day 0) rows. */
export function rowsForDay<T extends { day: number }>(
  rows: readonly T[],
  day: number,
): T[] {
  const own = rows.filter((r) => r.day === day);
  return own.length > 0 ? own : rows.filter((r) => r.day === 0);
}

export function periodsForDay(rows: readonly BellRow[], day: number) {
  return numberPeriods(rowsForDay(rows, day));
}

/** `{ default, days: { "5": [...] } }` view of all stored rows. */
export function groupSchedule(rows: readonly BellRow[]): {
  default: PeriodDto[];
  days: Record<string, PeriodDto[]>;
} {
  const days: Record<string, PeriodDto[]> = {};
  for (const day of [...new Set(rows.map((r) => r.day))].sort()) {
    if (day !== 0)
      days[String(day)] = numberPeriods(rows.filter((r) => r.day === day));
  }
  return {
    default: numberPeriods(rows.filter((r) => r.day === 0)),
    days,
  };
}

/** index → isBreak of one weekday (conflict-checker input). */
export function layoutOf(
  rows: readonly BellRow[],
  day: number,
): Map<number, boolean> {
  return new Map(rowsForDay(rows, day).map((r) => [r.index, r.isBreak]));
}

/** Ordered, non-overlapping, start before end. */
export function assertBellSchedule(
  periods: readonly BellRowInput[],
  prefix = '',
): void {
  const sorted = [...periods].sort((a, b) => a.index - b.index);
  sorted.forEach((p, i) => {
    const fail = (message: string) => {
      const full = `${prefix}Period ${p.index}: ${message}`;
      return invalid(full, [full]);
    };
    if (p.startTime >= p.endTime) throw fail('start must be before end');
    const prev = sorted[i - 1];
    if (prev && prev.index === p.index) throw fail('is repeated');
    if (prev && prev.endTime > p.startTime)
      throw fail(`overlaps period ${prev.index}`);
  });
}
