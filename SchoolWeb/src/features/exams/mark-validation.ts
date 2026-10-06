import { ApiError } from "@/lib/api-error";

const MARKS_PATTERN = /^\d+(\.\d{1,2})?$/;

/** Blank is pending (null), never 0. Up to two decimals. */
export function parseMarks(text: string): number | null {
  const value = text.trim();
  return value ? Number(value) : null;
}

export function marksError(text: string, maxMarks: number): string | null {
  const value = text.trim();
  if (!value) return null;
  if (!MARKS_PATTERN.test(value)) return "Use a number with up to 2 decimals";
  if (Number(value) > maxMarks) return `At most ${maxMarks}`;
  return null;
}

export function marksText(marks: number | null): string {
  return marks === null || marks === undefined ? "" : String(marks);
}

/** Student ids named in a 400 submit error (pending rows), in whichever shape the API sends them. */
export function pendingIdsFromError(error: unknown): string[] {
  if (!(error instanceof ApiError) || !error.details || typeof error.details !== "object") return [];
  const details = error.details as { studentIds?: unknown; pending?: unknown; rows?: unknown };
  const list = details.studentIds ?? details.pending ?? details.rows ?? (Array.isArray(error.details) ? error.details : []);
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => (typeof item === "string" ? item : (item as { studentId?: unknown })?.studentId))
    .filter((id): id is string => typeof id === "string");
}
