export interface MarkRowInput {
  studentId: string;
  marks: number | null;
  absent: boolean;
  remark?: string | null;
}

export interface NormalizedRow {
  studentId: string;
  /** Hundredths; null for absent or pending. */
  marksH: number | null;
  absent: boolean;
  remark: string | null;
}

export interface RowProblem {
  studentId: string;
  problem: string;
}

/**
 * Validates entered rows: roster students only, once each, 0 ≤ marks ≤ max
 * (two decimals at most). Absent rows store no marks; `marks: null` without
 * absent stays pending (never zero).
 */
export function checkRows(
  rows: readonly MarkRowInput[],
  maxMarks: number,
  roster: ReadonlySet<string>,
): { rows: NormalizedRow[]; problems: RowProblem[] } {
  const problems: RowProblem[] = [];
  const seen = new Set<string>();
  const normalized: NormalizedRow[] = [];
  for (const row of rows) {
    const { studentId } = row;
    if (seen.has(studentId)) problems.push({ studentId, problem: 'DUPLICATE' });
    seen.add(studentId);
    if (!roster.has(studentId))
      problems.push({ studentId, problem: 'NOT_IN_SECTION' });
    const marksH =
      row.absent || row.marks === null ? null : Math.round(row.marks * 100);
    if (marksH !== null) {
      if (Math.abs(row.marks! * 100 - marksH) > 1e-6)
        problems.push({ studentId, problem: 'TOO_MANY_DECIMALS' });
      if (marksH < 0) problems.push({ studentId, problem: 'NEGATIVE' });
      if (marksH > maxMarks * 100)
        problems.push({ studentId, problem: 'ABOVE_MAX' });
    }
    normalized.push({
      studentId,
      marksH,
      absent: row.absent,
      remark: row.remark?.trim() || null,
    });
  }
  return { rows: normalized, problems };
}

/** Roster students whose marks are neither entered nor absent. */
export function pendingStudents(
  roster: readonly string[],
  entered: ReadonlyMap<string, { marksH: number | null; absent: boolean }>,
): string[] {
  return roster.filter((id) => {
    const mark = entered.get(id);
    return !mark || (!mark.absent && mark.marksH === null);
  });
}
