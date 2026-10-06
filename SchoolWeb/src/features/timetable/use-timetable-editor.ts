import { useMemo, useState } from "react";
import { errorMessage } from "@/lib/error-messages";
import { toast } from "@/lib/toast";
import { useDialogState } from "@/lib/use-dialog-state";
import { useCheckConflicts, usePublishTimetable, useSaveSlots } from "./api";
import { cellKey, cellsToSlotInputs, slotsToCells, type CellMap, type CellValue, type GridRow } from "./grid";
import type { Timetable } from "./types";
import { useConflicts } from "./use-conflicts";

export interface CellTarget {
  day: number;
  row: GridRow;
}

/** Local draft of a section's grid (`day-periodIndex` → cell) with save / check / publish. */
export function useTimetableEditor(sectionId: string, sessionId: string, timetable: Timetable | null, rows: GridRow[]) {
  const [draft, setDraft] = useState<CellMap | null>(null);
  const saved = useMemo(() => slotsToCells(timetable?.slots ?? []), [timetable]);
  const cells = draft ?? saved;
  const conflicts = useConflicts(rows);
  const cellDialog = useDialogState<CellTarget>();
  const publishDialog = useDialogState<true>();
  const save = useSaveSlots(sectionId);
  const check = useCheckConflicts(sectionId);
  const publish = usePublishTimetable(sectionId);

  const setCell = (day: number, periodIndex: number, value: CellValue | null) => {
    const next = { ...cells };
    if (value) next[cellKey(day, periodIndex)] = value;
    else delete next[cellKey(day, periodIndex)];
    setDraft(next);
    conflicts.clear();
    cellDialog.close();
  };

  // Errors are toasted by the mutation hook; callers only need to know whether to continue.
  const saveIfDirty = async () => {
    if (!draft) return true;
    try {
      await save.mutateAsync({ sessionId, slots: cellsToSlotInputs(draft) });
      setDraft(null);
      return true;
    } catch {
      return false;
    }
  };

  const runCheck = async () => {
    if (!(await saveIfDirty())) return;
    try {
      const list = await check.mutateAsync();
      conflicts.set(list);
      if (list.length === 0) toast.success("No conflicts found");
    } catch {
      // toasted by useCheckConflicts
    }
  };

  const runPublish = async () => {
    if (!(await saveIfDirty())) return publishDialog.close();
    try {
      await publish.mutateAsync();
      conflicts.clear();
    } catch (error) {
      if (!conflicts.fromError(error)) toast.error(errorMessage(error));
    }
    publishDialog.close();
  };

  return {
    cells,
    dirty: draft !== null,
    discard: () => setDraft(null),
    setCell,
    cellDialog,
    publishDialog,
    conflicts,
    saveDraft: () => void saveIfDirty(),
    runCheck: () => void runCheck(),
    runPublish: () => void runPublish(),
    saving: save.isPending,
    checking: check.isPending,
    publishing: publish.isPending || (publishDialog.open && save.isPending),
  };
}

export type TimetableEditor = ReturnType<typeof useTimetableEditor>;
