"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { CATEGORY_OPTIONS } from "../options";
import { useNoteForm } from "../use-note-form";

interface NoteFormDialogProps {
  studentId: string;
  studentName: string;
  onClose: () => void;
}

export function NoteFormDialog({ studentId, studentName, onClose }: NoteFormDialogProps) {
  const { form, submit, submitting, formError } = useNoteForm(studentId, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Add feedback note"
      description={studentName}
      submitLabel="Add note"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <SelectField name="category" label="Category" options={CATEGORY_OPTIONS} required />
      <TextareaField name="note" label="Note" required rows={5} />
      <CheckboxField
        name="visibleToParent"
        label="Visible to parents"
        hint="Parents see this note under Teacher feedback."
      />
    </FormDialog>
  );
}
