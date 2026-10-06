import { useMemo, useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { errorMessage } from "@/lib/error-messages";
import { conflictItems, scheduleClashes } from "./conflict-details";
import { useSaveSchedule } from "./exams-api";
import { reached } from "./options";
import { newRow, rowProblems, rowsForClash, rowsFromPapers, rowsSignature, toPaperInputs, type ScheduleRow } from "./schedule-rows";
import type { Exam } from "./types";

interface Feedback {
  rows: Record<string, string[]>;
  general: string[];
}

const NO_FEEDBACK: Feedback = { rows: {}, general: [] };

/**
 * Local date sheet on top of the saved papers. Edits belong to one saved version,
 * so a reload after saving starts clean.
 */
export function useScheduleEditor(exam: Exam) {
  const can = useCan();
  const save = useSaveSchedule(exam.id);
  const initial = useMemo(() => rowsFromPapers(exam.papers), [exam.papers]);
  const source = rowsSignature(initial);
  const [state, setState] = useState<{ source: string; rows: ScheduleRow[] | null; feedback: Feedback }>({
    source,
    rows: null,
    feedback: NO_FEEDBACK,
  });
  const current = state.source === source ? state : { source, rows: null, feedback: NO_FEEDBACK };
  const rows = current.rows ?? initial;

  const canEdit = can("exams.edit");
  const readOnly = !canEdit || reached(exam.status, "MARKS_OPEN");
  const dirty = !readOnly && current.rows !== null && rowsSignature(rows) !== source;

  const setRows = (next: ScheduleRow[]) => setState({ source, rows: next, feedback: current.feedback });
  const setFeedback = (feedback: Feedback) => setState({ source, rows, feedback });

  const classIds = exam.classIds?.length ? exam.classIds : (exam.classes ?? []).map((item) => item.id);
  const classNames = new Map<string, string>([
    ...(exam.papers ?? []).flatMap((paper) => (paper.className ? [[paper.classId, paper.className] as const] : [])),
    ...(exam.classes ?? []).map((item) => [item.id, item.name] as const),
  ]);

  const submit = () => {
    const problems: Feedback = { rows: {}, general: [] };
    for (const row of rows) {
      const found = rowProblems(row, rows);
      if (found.length) problems.rows[row.key] = found;
    }
    if (rows.length === 0) problems.general.push("Add at least one paper");
    if (Object.keys(problems.rows).length || problems.general.length) return setFeedback(problems);

    setFeedback(NO_FEEDBACK);
    save.mutate(toPaperInputs(rows), {
      onError: (error) => {
        const items = conflictItems(error);
        if (!items || items.length === 0) return setFeedback({ rows: {}, general: [errorMessage(error)] });
        const clashes: Feedback = { rows: {}, general: [] };
        for (const clash of scheduleClashes(items)) {
          const affected = rowsForClash(clash, rows);
          if (affected.length === 0) clashes.general.push(clash.message);
          for (const row of affected) clashes.rows[row.key] = [...(clashes.rows[row.key] ?? []), clash.message];
        }
        setFeedback(clashes);
      },
    });
  };

  const notice = !readOnly
    ? "Saving the date sheet checks for clashes and marks the exam as scheduled."
    : canEdit
      ? "The date sheet is locked once marks entry opens."
      : "You can view the date sheet; changing it needs edit permission.";

  return {
    readOnly,
    dirty,
    notice,
    // A DRAFT exam can save its papers as-is to become SCHEDULED.
    canSave: dirty || (exam.status === "DRAFT" && rows.length > 0),
    groups: classIds.map((classId) => ({
      classId,
      className: classNames.get(classId) ?? "Class",
      rows: rows.filter((row) => row.classId === classId),
    })),
    feedback: current.feedback,
    addRow: (classId: string) => {
      const last = [...rows].reverse().find((row) => row.classId === classId);
      setRows([...rows, newRow(classId, last)]);
    },
    updateRow: (key: string, patch: Partial<ScheduleRow>) =>
      setRows(rows.map((row) => (row.key === key ? { ...row, ...patch } : row))),
    removeRow: (key: string) => setRows(rows.filter((row) => row.key !== key)),
    reset: () => setState({ source, rows: null, feedback: NO_FEEDBACK }),
    submit,
    saving: save.isPending,
  };
}

export type ScheduleEditor = ReturnType<typeof useScheduleEditor>;
