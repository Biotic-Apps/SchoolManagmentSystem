"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { TextField } from "@/components/shared/form/TextField";
import type { SchoolClass } from "../types";
import { useClassForm } from "../use-class-form";

interface ClassFormDialogProps {
  item: SchoolClass | null;
  schoolId: string;
  onClose: () => void;
}

export function ClassFormDialog({ item, schoolId, onClose }: ClassFormDialogProps) {
  const { form, submit, submitting, formError } = useClassForm(item, schoolId, onClose);
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={item ? "Edit class" : "Add class"}
      submitLabel={item ? "Save changes" : "Create class"}
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <TextField name="name" label="Name" required placeholder="e.g. Grade 1" />
      <TextField
        name="levelOrder"
        label="Level order"
        required
        inputMode="numeric"
        hint="Sorts classes from junior to senior, e.g. Nursery = 0, Grade 1 = 1."
      />
    </FormDialog>
  );
}
