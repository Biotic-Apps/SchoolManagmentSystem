import type { ImportKind, ImportStatus } from "./import-types";

export interface ImportKindInfo {
  id: ImportKind;
  label: string;
  description: string;
}

export const IMPORT_KINDS: ImportKindInfo[] = [
  {
    id: "STUDENTS",
    label: "Students",
    description: "Students with class, section and roll no; admission numbers are generated when blank.",
  },
  {
    id: "GUARDIANS",
    label: "Guardians",
    description: "Parents and guardians linked by admission no; parent accounts can be created too.",
  },
  {
    id: "STAFF",
    label: "Staff",
    description: "Staff with their role and class, section and subject assignments by code.",
  },
  {
    id: "OPENING_BALANCES",
    label: "Opening balances",
    description: "Dues carried over per student: admission no, amount and as-of date.",
  },
  {
    id: "FEE_PLANS",
    label: "Fee plans",
    description: "Fee plans with their fee heads and amounts.",
  },
];

export function importKindLabel(kind: string | null | undefined): string {
  return IMPORT_KINDS.find((item) => item.id === kind)?.label ?? kind ?? "";
}

export const IMPORT_FILE_EXTENSIONS = [".xlsx", ".csv"];
export const IMPORT_FILE_ACCEPT = [
  ".xlsx",
  ".csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
].join(",");
export const IMPORT_MAX_SIZE_MB = 10;

/** Statuses the server is still working on; the detail is polled while in one of these. */
export const IMPORT_BUSY_STATUSES: ImportStatus[] = ["VALIDATING", "COMMITTING"];
export const IMPORT_POLL_MS = 2000;
