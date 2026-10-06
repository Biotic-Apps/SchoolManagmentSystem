import { useMemo, useState } from "react";
import { useReportUnsaved } from "@/components/shared/UnsavedChangesGuard";
import type { DiaryEntry } from "@/features/diary/types";
import type { StudentSummary } from "@/features/students/types";
import { useSaveHomeworkStatus } from "./api";
import type { HomeworkStatus, HomeworkStatusEntry } from "./types";

type StatusMap = Record<string, HomeworkStatus>;

/** The API may carry saved ticks on the diary entry; read it tolerantly. */
type DiaryWithStatus = DiaryEntry & { homeworkStatus?: HomeworkStatusEntry[] | null };

export interface HomeworkRow {
  id: string;
  name: string;
  photoUrl: string | null;
  rollNo: number | null;
  status: HomeworkStatus | null;
  changed: boolean;
}

function prefillOf(entry: DiaryEntry | null): StatusMap {
  const saved = (entry as DiaryWithStatus | null)?.homeworkStatus ?? [];
  return Object.fromEntries(saved.map((item) => [item.studentId, item.status]));
}

/** Unsaved ticks for one diary entry; switching entry starts clean. */
export function useHomeworkEditor(entry: DiaryEntry | null, students: StudentSummary[]) {
  const key = entry ? `${entry.id}:${entry.revision}` : "";
  const [state, setState] = useState<{ key: string; saved: StatusMap; edits: StatusMap }>({
    key,
    saved: {},
    edits: {},
  });
  const current = state.key === key ? state : { key, saved: {}, edits: {} };
  const base = useMemo(() => ({ ...prefillOf(entry), ...current.saved }), [entry, current.saved]);
  const save = useSaveHomeworkStatus();
  const dirty = Object.keys(current.edits).length > 0;
  useReportUnsaved(dirty);

  const rows: HomeworkRow[] = students.map((student) => ({
    id: student.id,
    name: student.name,
    photoUrl: student.photoUrl,
    rollNo: student.rollNo,
    status: current.edits[student.id] ?? base[student.id] ?? null,
    changed: student.id in current.edits,
  }));

  const setStatuses = (ids: string[], status: HomeworkStatus) =>
    setState(() => {
      const edits = { ...current.edits };
      for (const id of ids) {
        if (base[id] === status) delete edits[id];
        else edits[id] = status;
      }
      return { ...current, edits };
    });

  const entries: HomeworkStatusEntry[] = rows
    .filter((row): row is HomeworkRow & { status: HomeworkStatus } => !!row.status)
    .map((row) => ({ studentId: row.id, status: row.status }));

  return {
    rows,
    dirty,
    marked: entries.length,
    setStatus: (studentId: string, status: HomeworkStatus) => setStatuses([studentId], status),
    markAllDone: () => setStatuses(rows.map((row) => row.id), "DONE"),
    reset: () => setState({ ...current, edits: {} }),
    saving: save.isPending,
    save: () => {
      if (!entry || entries.length === 0) return;
      save.mutate(
        { diaryId: entry.id, entries },
        { onSuccess: () => setState({ key, saved: { ...current.saved, ...current.edits }, edits: {} }) },
      );
    },
  };
}

export type HomeworkEditor = ReturnType<typeof useHomeworkEditor>;
