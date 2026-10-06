"use client";

import { Save } from "lucide-react";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { useReportUnsaved } from "@/components/shared/UnsavedChangesGuard";
import { Button } from "@/components/ui/Button";
import { useRoomOptions } from "@/features/classes/rooms-api";
import type { Exam } from "../../types";
import { useScheduleEditor } from "../../use-schedule-editor";
import { ScheduleClassGroup } from "./ScheduleClassGroup";

export function ScheduleTab({ exam }: { exam: Exam }) {
  const editor = useScheduleEditor(exam);
  const rooms = useRoomOptions(exam.branchId);
  useReportUnsaved(editor.dirty);

  return (
    <div className="flex flex-col gap-6">
      <InlineNotice>{editor.notice}</InlineNotice>
      {editor.feedback.general.length > 0 && (
        <InlineNotice tone="error">
          <ul className="flex flex-col gap-1">
            {editor.feedback.general.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </InlineNotice>
      )}
      {editor.groups.map((group) => (
        <ScheduleClassGroup
          key={group.classId}
          classId={group.classId}
          className={group.className}
          rows={group.rows}
          problems={editor.feedback.rows}
          roomOptions={rooms.options}
          readOnly={editor.readOnly}
          onAdd={() => editor.addRow(group.classId)}
          onChange={editor.updateRow}
          onRemove={editor.removeRow}
        />
      ))}
      {!editor.readOnly && (
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={editor.reset} disabled={!editor.dirty || editor.saving}>
            Discard changes
          </Button>
          <Button onClick={editor.submit} loading={editor.saving} disabled={!editor.canSave}>
            <Save />
            Save schedule
          </Button>
        </div>
      )}
    </div>
  );
}
