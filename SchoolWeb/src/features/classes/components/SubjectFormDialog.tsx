"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { TextField } from "@/components/shared/form/TextField";
import type { Subject } from "../types";
import { useSubjectForm } from "../use-subject-form";

interface SubjectFormDialogProps {
  item: Subject | null;
  schoolId: string;
  onClose: () => void;
}

export function SubjectFormDialog({ item, schoolId, onClose }: SubjectFormDialogProps) {
  const { form, submit, submitting, formError } = useSubjectForm(item, schoolId, onClose);
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={item ? "Edit subject" : "Add subject"}
      submitLabel={item ? "Save changes" : "Create subject"}
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <TextField
        name="code"
        label="Code"
        required
        hint="Short unique code, e.g. ENG or MATH"
        autoCapitalize="characters"
        inputClassName="uppercase"
      />
      <TextField name="name" label="Name" required placeholder="e.g. English" />
    </FormDialog>
  );
}
