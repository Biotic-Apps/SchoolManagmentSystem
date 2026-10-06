"use client";

import type { Option } from "@/components/shared/OptionSelect";
import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { AttachmentsField } from "@/features/files/components/AttachmentsField";
import { formatDate } from "@/lib/format";
import { useDiaryEditor } from "../use-diary-editor";
import type { DiaryEntry } from "../types";

interface DiaryEditorDialogProps {
  sectionId: string;
  date: string;
  entry: DiaryEntry | null;
  subjectOptions: Option[];
  onClose: () => void;
}

export function DiaryEditorDialog({ sectionId, date, entry, subjectOptions, onClose }: DiaryEditorDialogProps) {
  const { form, submit, submitting, formError } = useDiaryEditor({ sectionId, date, entry }, onClose);
  const published = entry?.status === "PUBLISHED";

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={entry ? `Edit ${entry.subject.name} diary` : "Add diary entry"}
      description={
        published
          ? `Published entries can be corrected until the diary closes for ${formatDate(date)}.`
          : `Saved as a draft for ${formatDate(date)}.`
      }
      submitLabel={published ? "Save changes" : "Save draft"}
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="lg"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          name="subjectId"
          label="Subject"
          options={subjectOptions}
          required
          disabled={!!entry}
          className="sm:col-span-2"
        />
        <TextareaField name="topics" label="Topics covered" rows={4} required className="sm:col-span-2" />
        <TextareaField name="homework" label="Homework" rows={3} className="sm:col-span-2" />
        <TextField name="dueDate" label="Homework due" type="date" min={date} />
      </div>
      <AttachmentsField name="attachmentFileIds" initial={entry?.attachments} />
    </FormDialog>
  );
}
