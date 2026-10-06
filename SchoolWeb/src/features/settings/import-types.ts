export type ImportKind = "STUDENTS" | "GUARDIANS" | "STAFF" | "OPENING_BALANCES" | "FEE_PLANS";

export type ImportStatus =
  | "VALIDATING"
  | "READY"
  | "INVALID"
  | "COMMITTING"
  | "COMMITTED"
  | "REVERTED"
  | "FAILED";

export interface ImportTotals {
  rows: number;
  valid: number;
  invalid: number;
}

export interface ImportRowError {
  row: number;
  column?: string | null;
  message: string;
}

export type ImportPreviewRow = Record<string, unknown>;

export type ImportReconciliation = Record<string, unknown> & {
  fileTotalMinor?: number | null;
  importedTotalMinor?: number | null;
};

export interface ImportDetail {
  id?: string;
  kind?: ImportKind;
  status: ImportStatus;
  fileName?: string | null;
  totals: ImportTotals;
  errors: ImportRowError[];
  preview: ImportPreviewRow[];
  reconciliation?: ImportReconciliation | null;
  error?: string | null;
}

export interface ImportSummary {
  id: string;
  kind: ImportKind | string;
  status: ImportStatus | string;
  fileName: string | null;
  totals: ImportTotals | null;
  startedAt: string | null;
  startedBy: string | null;
}

export interface ImportUploadInput {
  file: File;
  kind: ImportKind;
  branchId: string;
  sessionId: string;
}
