import { useMemo, useState } from "react";
import { marksError, marksText, parseMarks } from "./mark-validation";
import type { MarkRow, MarkRowInput, MarkSheet } from "./types";

interface Edit {
  marks: string;
  absent: boolean;
  remark: string;
}

export interface MarkEditorRow extends Omit<MarkRow, "marks" | "remark"> {
  marks: string;
  remark: string;
  error: string | null;
  pending: boolean;
  belowPass: boolean;
}

function baseEdit(row: MarkRow): Edit {
  return { marks: marksText(row.marks), absent: row.absent, remark: row.remark ?? "" };
}

function sameEdit(a: Edit, b: Edit): boolean {
  return a.marks.trim() === b.marks.trim() && a.absent === b.absent && a.remark === b.remark;
}

/** Unsaved marks on top of the loaded sheet; a status change (save, submit, review) starts clean. */
export function useMarkSheetEditor(sheet: MarkSheet | undefined) {
  const key = sheet ? `${sheet.id}:${sheet.status}` : "";
  const [state, setState] = useState<{ key: string; edits: Record<string, Edit> }>({ key, edits: {} });
  const edits = useMemo(() => (state.key === key ? state.edits : {}), [state, key]);
  const maxMarks = sheet?.paper.maxMarks ?? 0;
  const passMarks = sheet?.paper.passMarks ?? 0;

  const rows: MarkEditorRow[] = useMemo(
    () =>
      (sheet?.rows ?? []).map((row) => {
        const edit = edits[row.studentId] ?? baseEdit(row);
        const error = edit.absent ? null : marksError(edit.marks, maxMarks);
        const value = error ? null : parseMarks(edit.marks);
        return {
          ...row,
          ...edit,
          error,
          pending: !edit.absent && !edit.marks.trim(),
          belowPass: value !== null && value < passMarks,
        };
      }),
    [sheet, edits, maxMarks, passMarks],
  );

  const update = (studentId: string, patch: Partial<Edit>) => {
    const row = sheet?.rows?.find((item) => item.studentId === studentId);
    if (!row) return;
    setState((current) => {
      const base = current.key === key ? current.edits : {};
      const next = { ...(base[studentId] ?? baseEdit(row)), ...patch };
      if (next.absent) next.marks = "";
      const nextEdits = { ...base };
      if (sameEdit(next, baseEdit(row))) delete nextEdits[studentId];
      else nextEdits[studentId] = next;
      return { key, edits: nextEdits };
    });
  };

  const input: MarkRowInput[] = rows.map((row) => ({
    studentId: row.studentId,
    marks: row.absent ? null : parseMarks(row.marks),
    absent: row.absent,
    remark: row.remark.trim() || undefined,
  }));

  const pending = rows.filter((row) => row.pending).length;
  const absent = rows.filter((row) => row.absent).length;

  return {
    rows,
    input,
    counts: { total: rows.length, entered: rows.length - pending - absent, pending, absent },
    pendingIds: rows.filter((row) => row.pending).map((row) => row.studentId),
    hasErrors: rows.some((row) => !!row.error),
    dirty: Object.keys(edits).length > 0,
    setMarks: (studentId: string, marks: string) => update(studentId, { marks }),
    setAbsent: (studentId: string, absent: boolean) => update(studentId, { absent }),
    setRemark: (studentId: string, remark: string) => update(studentId, { remark }),
    reset: () => setState({ key, edits: {} }),
  };
}

export type MarkSheetEditorState = ReturnType<typeof useMarkSheetEditor>;
