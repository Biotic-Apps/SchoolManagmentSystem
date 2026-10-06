import { useAttendanceSummary, useUnmarkedSections } from "./summary-api";
import type { SectionAttendanceRow } from "./types";

function totals(rows: SectionAttendanceRow[]) {
  const sum = (pick: (row: SectionAttendanceRow) => number) => rows.reduce((acc, row) => acc + pick(row), 0);
  const present = sum((row) => row.present);
  const absent = sum((row) => row.absent);
  const late = sum((row) => row.late);
  const leave = sum((row) => row.leave);
  const total = sum((row) => row.total);
  const marked = present + absent + late + leave;
  return {
    present,
    absent,
    late,
    leave,
    total,
    unmarked: Math.max(0, total - marked),
    percent: marked ? Math.round(((present + late) / marked) * 100) : null,
  };
}

/** Per-section attendance for a branch and day, plus sections with no submitted register. */
export function useBranchSummary(branchId: string | null, date: string) {
  const summary = useAttendanceSummary(branchId, date);
  const unmarked = useUnmarkedSections(branchId, date);
  const rows = summary.data ?? [];
  return {
    summary,
    unmarked,
    rows,
    totals: totals(rows),
    submittedCount: rows.filter((row) => row.status === "SUBMITTED" || row.status === "LOCKED").length,
  };
}
