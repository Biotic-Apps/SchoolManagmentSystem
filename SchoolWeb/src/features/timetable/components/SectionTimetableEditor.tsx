"use client";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { Section } from "@/features/classes/types";
import { cellKey, type GridDay, type GridRow } from "../grid";
import type { Timetable } from "../types";
import { useTimetableEditor } from "../use-timetable-editor";
import { CellDialog } from "./CellDialog";
import { ConflictList } from "./ConflictList";
import { SlotCell } from "./SlotCell";
import { TimetableToolbar } from "./TimetableToolbar";
import { WeekGrid } from "./WeekGrid";

interface SectionTimetableEditorProps {
  section: Section;
  sessionId: string;
  timetable: Timetable | null;
  rows: GridRow[];
  days: GridDay[];
  canEdit: boolean;
  canPublish: boolean;
}

export function SectionTimetableEditor({ section, sessionId, timetable, rows, days, canEdit, canPublish }: SectionTimetableEditorProps) {
  const editor = useTimetableEditor(section.id, sessionId, timetable, rows);
  const target = editor.cellDialog.item;
  const sectionName = `${section.className} ${section.name}`;

  return (
    <div className="flex flex-col gap-4">
      <TimetableToolbar timetable={timetable} editor={editor} canEdit={canEdit} canPublish={canPublish} />
      <ConflictList conflicts={editor.conflicts} />
      <WeekGrid
        caption={`Timetable for ${sectionName}`}
        days={days}
        rows={rows}
        flagged={editor.conflicts.keys}
        onCellClick={canEdit ? (day, row) => editor.cellDialog.show({ day, row }) : undefined}
        renderCell={(day, row) => (
          <SlotCell cell={editor.cells[cellKey(day, row.periodIndex)]} emptyLabel={canEdit ? "Add lesson" : undefined} />
        )}
      />
      {target && (
        <CellDialog
          section={section}
          target={target}
          value={editor.cells[cellKey(target.day, target.row.periodIndex)]}
          onApply={(value) => editor.setCell(target.day, target.row.periodIndex, value)}
          onClose={editor.cellDialog.close}
        />
      )}
      <ConfirmDialog
        open={editor.publishDialog.open}
        onOpenChange={editor.publishDialog.onOpenChange}
        title={`Publish timetable for ${sectionName}?`}
        description={
          editor.dirty
            ? "Your unsaved changes are saved first. Teachers of this section are notified once it is published."
            : "Teachers of this section are notified once it is published."
        }
        confirmLabel="Publish"
        loading={editor.publishing}
        onConfirm={editor.runPublish}
      />
    </div>
  );
}
