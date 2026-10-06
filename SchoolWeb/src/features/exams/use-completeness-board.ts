import { useCompleteness } from "./exams-api";
import type { CompletenessRow, Exam, MarkSheetStatus } from "./types";

export interface CompletenessGroup {
  key: string;
  title: string;
  cells: CompletenessRow[];
  entered: number;
  total: number;
}

const STATUSES: MarkSheetStatus[] = ["NOT_ENTERED", "DRAFT", "SUBMITTED", "RETURNED", "ACCEPTED"];

function groupRows(rows: CompletenessRow[]): CompletenessGroup[] {
  const groups = new Map<string, CompletenessGroup>();
  for (const row of rows) {
    const key = `${row.classId ?? row.className}:${row.sectionId}`;
    const group = groups.get(key) ?? { key, title: `${row.className} ${row.sectionName}`.trim(), cells: [], entered: 0, total: 0 };
    group.cells.push(row);
    group.entered += row.entered ?? 0;
    group.total += row.total ?? 0;
    groups.set(key, group);
  }
  return [...groups.values()]
    .map((group) => ({ ...group, cells: group.cells.sort((a, b) => a.subjectName.localeCompare(b.subjectName)) }))
    .sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
}

/** Mark entry progress per class/section and subject. */
export function useCompletenessBoard(exam: Exam) {
  const query = useCompleteness(exam.id, exam.branchId);
  const rows = query.data ?? [];
  const counts = STATUSES.map((status) => ({ status, count: rows.filter((row) => row.status === status).length }));

  return {
    query,
    groups: groupRows(rows),
    counts,
    sheets: rows.length,
    accepted: rows.filter((row) => row.status === "ACCEPTED").length,
  };
}
