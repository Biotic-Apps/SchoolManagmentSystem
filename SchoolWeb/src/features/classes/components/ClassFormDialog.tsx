"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { TextField } from "@/components/shared/form/TextField";
import type { SchoolClass } from "../types";
import { useClassForm } from "../use-class-form";

interface ClassFormDialogProps {
  schoolId: string;
  levelOrder: number;
  onClose: () => void;
  onCreated: (created: SchoolClass) => void;
}

/** "Add class": just the name; sections, subjects and teachers are set up on the next screen. */
export function ClassFormDialog({ schoolId, levelOrder, onClose, onCreated }: ClassFormDialogProps) {
  const { form, submit, submitting, formError } = useClassForm(schoolId, levelOrder, onCreated);
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Add class"
      description="It is added after your last class. Next you'll add its sections, subjects and teachers."
      submitLabel="Add and set up"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <TextField name="name" label="Class name" required placeholder="e.g. O Level 1" autoComplete="off" />
    </FormDialog>
  );
}
