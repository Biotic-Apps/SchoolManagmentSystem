import { useMemo } from "react";
import { useDialogState } from "@/lib/use-dialog-state";
import { useSaveStatus } from "@/lib/use-save-status";
import { builderSaveKey, useDiscardTimetable, usePublishTimetable } from "./builder-api";
import type { TimetableBuilder } from "./builder-types";
import { conflictMarks } from "./conflict-marks";
import { cellKey, slotsToCells, type CellValue, type GridRow } from "./grid";
import { gridFrame } from "./grid-frame";
import type { LessonFormValues } from "./lesson-schema";
import { publishBlockedReason, stateOf } from "./timetable-state";
import { useBuilderCells } from "./use-builder-cells";

export interface BuilderTarget {
  day: number;
  row: GridRow;
}

interface Rights {
  canEdit: boolean;
  canPublish: boolean;
}

/** Builder for one section: grid frame from the bell schedule, autosaved cells, publish / discard. */
export function useTimetableBuilder(builder: TimetableBuilder, workingDays: number[], fallback: Rights) {
  const sectionId = builder.section.id;
  const { timetable } = builder;
  const cells = useBuilderCells(sectionId);
  const publish = usePublishTimetable(sectionId);
  const discard = useDiscardTimetable(sectionId);
  const dialog = useDialogState<BuilderTarget>();
  const discardDialog = useDialogState<true>();
  const saveStatus = useSaveStatus(builderSaveKey(sectionId));

  // Per-section rights from the API (teachers edit only their class-teacher section); older APIs: permissions.
  const canEdit = builder.canEdit ?? timetable.canEdit ?? fallback.canEdit;
  const mayPublish = builder.canPublish ?? timetable.canPublishRole ?? fallback.canPublish;

  const frame = useMemo(
    () => gridFrame(timetable.periods, timetable.dayPeriods, workingDays),
    [timetable.periods, timetable.dayPeriods, workingDays],
  );
  const grid = useMemo(() => slotsToCells(timetable.slots), [timetable.slots]);
  const marks = useMemo(() => conflictMarks(builder.conflicts), [builder.conflicts]);
  const state = stateOf(timetable);
  const blocked = saveStatus === "saving" ? "Saving…" : publishBlockedReason(timetable, builder.conflicts, mayPublish);

  const save = (target: BuilderTarget, values: LessonFormValues, cell: CellValue) => {
    cells.save(
      { day: target.day, periodIndex: target.row.periodIndex },
      { subjectId: values.subjectId, staffId: values.staffId, roomId: values.roomId || null, allocate: values.allocate },
      { day: target.day, periodIndex: target.row.periodIndex, ...cell },
    );
    dialog.close();
  };

  return {
    builder,
    frame,
    cells: grid,
    cellAt: (day: number, periodIndex: number) => grid[cellKey(day, periodIndex)],
    marks,
    state,
    saveStatus,
    canEdit,
    mayPublish,
    blocked,
    dialog,
    save,
    remove: (target: BuilderTarget) => {
      cells.clear({ day: target.day, periodIndex: target.row.periodIndex });
      dialog.close();
    },
    publishing: publish.isPending,
    publish: () => void publish.mutateAsync().catch(() => undefined),
    discardDialog,
    discarding: discard.isPending,
    showDiscard: mayPublish && state === "PUBLISHED_WITH_CHANGES",
    discard: async () => {
      try {
        await discard.mutateAsync();
      } finally {
        discardDialog.close();
      }
    },
  };
}

export type BuilderState = ReturnType<typeof useTimetableBuilder>;
