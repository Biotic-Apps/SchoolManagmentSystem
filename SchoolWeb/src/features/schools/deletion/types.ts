import type { RecordStatus } from "@/config/options";

export type DeletionSummaryKey =
  | "branches"
  | "users"
  | "staff"
  | "students"
  | "guardians"
  | "sessions"
  | "classes"
  | "sections"
  | "subjects"
  | "timetables"
  | "attendance"
  | "exams"
  | "invoices"
  | "payments"
  | "files";

/** GET /schools/:id/deletion-preview */
export interface SchoolDeletionPreview {
  schoolId: string;
  code: string;
  name: string;
  status: RecordStatus;
  /** No other active school would remain. */
  lastActiveSchool: boolean;
  summary: { key: DeletionSummaryKey; count: number }[];
  removedUsers: number;
  keptUsers: number;
  totalRows: number;
  tables: Record<string, number>;
}

export type SchoolDeletionState = "IDLE" | "RUNNING" | "FAILED" | "DELETED";

/** GET /schools/:id/deletion-status and DELETE /schools/:id */
export interface SchoolDeletionStatus {
  schoolId: string;
  state: SchoolDeletionState;
  error: string | null;
}
