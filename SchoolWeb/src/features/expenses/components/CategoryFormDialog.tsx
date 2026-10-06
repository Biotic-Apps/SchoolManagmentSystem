"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { TextField } from "@/components/shared/form/TextField";
import { useCategoryForm } from "../use-catalog-forms";

export function CategoryFormDialog({ schoolId, onClose }: { schoolId: string | null; onClose: () => void }) {
  const category = useCategoryForm(schoolId, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Add expense category"
      description="Available to every branch of this school."
      submitLabel="Add category"
      submitting={category.submitting}
      onSubmit={category.submit}
      form={category.form}
      error={category.formError}
    >
      <TextField name="name" label="Name" required maxLength={80} placeholder="e.g. Security services" />
      <TextField name="code" label="Code" hint="Optional short code, e.g. SECURITY" maxLength={30} />
    </FormDialog>
  );
}
