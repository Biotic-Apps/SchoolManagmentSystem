"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { FormDialog } from "@/components/shared/FormDialog";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { CreatableSelectField } from "@/components/shared/form/CreatableSelectField";
import { Button } from "@/components/ui/Button";
import { classSetupHref } from "@/features/classes/links";
import type { TimetableBuilder } from "../builder-types";
import type { CellValue, GridRow } from "../grid";
import { dayName } from "../options";
import { useLessonDialog, type LessonTarget } from "../use-lesson-dialog";
import type { LessonFormValues } from "../lesson-schema";
import { LessonWarnings } from "./LessonWarnings";

interface LessonDialogProps {
  builder: TimetableBuilder;
  target: LessonTarget;
  row: GridRow;
  /** That day's own time when it differs from the row. */
  time?: string;
  value: CellValue | undefined;
  onSave: (values: LessonFormValues, cell: CellValue) => void;
  onRemove: () => void;
  onClose: () => void;
}

export function LessonDialog({ builder, target, row, time, value, onSave, onRemove, onClose }: LessonDialogProps) {
  const dialog = useLessonDialog(builder, target, value);
  const { form } = dialog;
  const sectionName = `${builder.section.class.name} ${builder.section.name}`;

  const submit = form.handleSubmit((values) =>
    onSave(values, {
      subject: { id: values.subjectId, name: dialog.nameOf(dialog.subjectOptions, values.subjectId) },
      staff: { id: values.staffId, name: dialog.nameOf(dialog.staffOptions, values.staffId) },
      room: values.roomId ? { id: values.roomId, name: dialog.nameOf(dialog.roomOptions, values.roomId) } : null,
    }),
  );

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`${dayName(target.day)} · ${row.title} (${time ?? row.time})`}
      description={sectionName}
      submitLabel="Save"
      onSubmit={submit}
      form={form}
    >
      {builder.lessons.length === 0 ? (
        <InlineNotice tone="warning">
          This class has no subjects yet.{" "}
          <Link
            href={classSetupHref(builder.section.class.id, builder.section.branchId, builder.timetable.sessionId, "subjects")}
            className="font-medium underline"
          >
            Add subjects
          </Link>
        </InlineNotice>
      ) : (
        <CreatableSelectField name="subjectId" label="Subject" options={dialog.subjectOptions} required />
      )}
      <CreatableSelectField
        name="staffId"
        label="Teacher"
        options={dialog.staffOptions}
        placeholder={dialog.staffLoading ? "Loading teachers" : "Select"}
        required
      />
      {dialog.canAllocate && dialog.lesson && (
        <CheckboxField
          name="allocate"
          label={`Make ${dialog.teacherName || "this teacher"} the ${dialog.lesson.subject.name} teacher of ${sectionName}`}
          hint="Then every lesson of this subject here is theirs by default."
        />
      )}
      <CreatableSelectField
        name="roomId"
        label="Room"
        options={dialog.roomOptions}
        emptyLabel="No room"
        createLabel="New room"
        onCreate={dialog.createRoom}
      />
      <LessonWarnings dialog={dialog} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-caption text-fg-muted">Saved to the draft right away. Teachers and parents see it after you publish.</p>
        {value && (
          <Button variant="danger" size="sm" onClick={onRemove}>
            <Trash2 />
            Remove lesson
          </Button>
        )}
      </div>
    </FormDialog>
  );
}
