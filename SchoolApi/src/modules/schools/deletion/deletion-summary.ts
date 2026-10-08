import type { PurgeCounts } from './school-purge.service';

/** Headline categories shown before deleting, in display order. */
const SUMMARY_TABLES = {
  branches: ['branches'],
  users: [],
  staff: ['staff'],
  students: ['students'],
  guardians: ['guardians'],
  sessions: ['academic_sessions'],
  classes: ['classes'],
  sections: ['sections'],
  subjects: ['subjects'],
  timetables: ['timetables'],
  attendance: ['attendance_entries', 'staff_attendance'],
  exams: ['exams'],
  invoices: ['invoices'],
  payments: ['payments'],
  files: ['files'],
} as const satisfies Record<string, readonly string[]>;

export type DeletionSummaryKey = keyof typeof SUMMARY_TABLES;
export const DELETION_SUMMARY_KEYS = Object.keys(
  SUMMARY_TABLES,
) as DeletionSummaryKey[];

export function summarize(
  counts: PurgeCounts,
): { key: DeletionSummaryKey; count: number }[] {
  return DELETION_SUMMARY_KEYS.map((key) => ({
    key,
    count:
      key === 'users'
        ? counts.removedUsers
        : SUMMARY_TABLES[key].reduce(
            (sum: number, table: string) => sum + (counts.tables[table] ?? 0),
            0,
          ),
  })).filter((item) => item.count > 0);
}

export const totalRows = (counts: PurgeCounts): number =>
  Object.values(counts.tables).reduce((sum, n) => sum + n, 0);
