"use client";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { TimetableBuilder } from "../builder-types";
import { useTimetableBuilder } from "../use-timetable-builder";
import { BuilderToolbar } from "./BuilderToolbar";
import { ConflictSummary } from "./ConflictSummary";
import { LessonDialog } from "./LessonDialog";
import { LessonsPanel } from "./LessonsPanel";
import { PeriodsHint } from "./PeriodsHint";
import { SlotCell } from "./SlotCell";
import { WeekGrid } from "./WeekGrid";

interface TimetableBuilderViewProps {
  builder: TimetableBuilder;
  workingDays: number[];
  canEdit: boolean;
  canPublish: boolean;
  /** Shown above the grid, e.g. the teacher's "Draft — your principal publishes it". */
  note?: React.ReactNode;
}

/** Lessons panel + week grid; each lesson is saved to the draft as soon as it is picked. */
export function TimetableBuilderView({ builder, workingDays, canEdit, canPublish, note }: TimetableBuilderViewProps) {
  const view = useTimetableBuilder(builder, workingDays, { canEdit, canPublish });
  const target = view.dialog.item;
  const sectionName = `${builder.section.class.name} ${builder.section.name}`;

  return (
    <div className="flex flex-col gap-4">
      <BuilderToolbar view={view} />
      {note}
      {view.canEdit && <PeriodsHint />}
      <ConflictSummary conflicts={builder.conflicts} />
      <div className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
        <LessonsPanel builder={builder} />
        <WeekGrid
          caption={`Timetable for ${sectionName}`}
          days={view.frame.days}
          rows={view.frame.rows}
          info={view.frame.info}
          marks={view.marks}
          onCellClick={view.canEdit ? (day, row) => view.dialog.show({ day, row }) : undefined}
          renderCell={(day, row) => (
            <SlotCell cell={view.cellAt(day, row.periodIndex)} emptyLabel={view.canEdit ? "+ Add lesson" : undefined} />
          )}
        />
      </div>
      {target && (
        <LessonDialog
          builder={builder}
          target={{ day: target.day, periodIndex: target.row.periodIndex }}
          row={target.row}
          time={view.frame.info(target.day, target.row.periodIndex).time}
          value={view.cellAt(target.day, target.row.periodIndex)}
          onSave={(values, cell) => view.save(target, values, cell)}
          onRemove={() => view.remove(target)}
          onClose={view.dialog.close}
        />
      )}
      <ConfirmDialog
        open={view.discardDialog.open}
        onOpenChange={view.discardDialog.onOpenChange}
        title={`Discard changes to ${sectionName}?`}
        description="The draft goes back to the published timetable. Lessons added or changed since the last publish are lost."
        confirmLabel="Discard changes"
        tone="danger"
        loading={view.discarding}
        onConfirm={() => void view.discard()}
      />
    </div>
  );
}
