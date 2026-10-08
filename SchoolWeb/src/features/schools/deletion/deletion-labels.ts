import type { DeletionSummaryKey } from "./types";

/** [singular, plural] for the preview list. */
const LABELS: Record<DeletionSummaryKey, [string, string]> = {
  branches: ["branch", "branches"],
  users: ["user account", "user accounts"],
  staff: ["staff member", "staff members"],
  students: ["student", "students"],
  guardians: ["guardian", "guardians"],
  sessions: ["academic session", "academic sessions"],
  classes: ["class", "classes"],
  sections: ["section", "sections"],
  subjects: ["subject", "subjects"],
  timetables: ["timetable", "timetables"],
  attendance: ["attendance record", "attendance records"],
  exams: ["exam", "exams"],
  invoices: ["fee invoice", "fee invoices"],
  payments: ["payment", "payments"],
  files: ["uploaded file", "uploaded files"],
};

export function deletionLabel(key: DeletionSummaryKey, count: number): string {
  const [one, many] = LABELS[key] ?? [key, key];
  return count === 1 ? one : many;
}
