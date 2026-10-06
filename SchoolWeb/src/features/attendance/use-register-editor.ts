import { useMemo, useState } from "react";
import { countStatuses } from "./options";
import type { AttendanceStatus, Register, RegisterEntry, RegisterEntryInput } from "./types";

interface Edit {
  status: AttendanceStatus | null;
  remark: string;
}

export interface EditorRow extends RegisterEntry {
  status: AttendanceStatus | null;
  remark: string;
  changed: boolean;
}

function registerKey(register: Register | undefined): string {
  return register ? `${register.sectionId}:${register.date}:${register.version}:${register.status}` : "";
}

/**
 * Local, unsaved marks on top of the loaded register. Edits belong to one register version,
 * so a reload (save, submit, someone else's submit) starts clean without an effect.
 */
export function useRegisterEditor(register: Register | undefined) {
  const key = registerKey(register);
  const [state, setState] = useState<{ key: string; edits: Record<string, Edit> }>({ key, edits: {} });
  const edits = useMemo(() => (state.key === key ? state.edits : {}), [state, key]);

  const rows: EditorRow[] = useMemo(
    () =>
      (register?.entries ?? []).map((entry) => {
        const edit = edits[entry.studentId];
        return {
          ...entry,
          status: edit ? edit.status : entry.status,
          remark: edit ? edit.remark : (entry.remark ?? ""),
          changed: !!edit,
        };
      }),
    [register, edits],
  );

  const update = (studentId: string, patch: Partial<Edit>) => {
    const entry = register?.entries.find((item) => item.studentId === studentId);
    if (!entry) return;
    setState((current) => {
      const base = current.key === key ? current.edits : {};
      const previous = base[studentId] ?? { status: entry.status, remark: entry.remark ?? "" };
      const next = { ...previous, ...patch };
      const unchanged = next.status === entry.status && next.remark === (entry.remark ?? "");
      const nextEdits = { ...base };
      if (unchanged) delete nextEdits[studentId];
      else nextEdits[studentId] = next;
      return { key, edits: nextEdits };
    });
  };

  const markAll = (status: AttendanceStatus, onlyUnmarked: boolean) => {
    for (const row of rows) {
      if (onlyUnmarked && row.status) continue;
      if (row.onLeave && !onlyUnmarked) continue;
      update(row.studentId, { status });
    }
  };

  const entries: RegisterEntryInput[] = rows
    .filter((row): row is EditorRow & { status: AttendanceStatus } => !!row.status)
    .map((row) => ({ studentId: row.studentId, status: row.status, remark: row.remark.trim() || undefined }));

  const counts = countStatuses(rows.map((row) => row.status));

  return {
    rows,
    counts,
    entries,
    dirty: Object.keys(edits).length > 0,
    allMarked: rows.length > 0 && counts.unmarked === 0,
    setStatus: (studentId: string, status: AttendanceStatus) => update(studentId, { status }),
    setRemark: (studentId: string, remark: string) => update(studentId, { remark }),
    markAll,
    reset: () => setState({ key, edits: {} }),
  };
}

export type RegisterEditor = ReturnType<typeof useRegisterEditor>;
