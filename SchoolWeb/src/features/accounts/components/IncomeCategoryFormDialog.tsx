"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { TextField } from "@/components/shared/form/TextField";
import { useIncomeCategoryForm } from "../use-category-form";

export function IncomeCategoryFormDialog({ schoolId, onClose }: { schoolId: string | null; onClose: () => void }) {
  const category = useIncomeCategoryForm(schoolId, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Add income category"
      description="Available to every branch of this school."
      submitLabel="Add category"
      submitting={category.submitting}
      onSubmit={category.submit}
      form={category.form}
      error={category.formError}
    >
      <TextField name="name" label="Name" required maxLength={80} placeholder="e.g. Donations" />
      <TextField name="code" label="Code" hint="Optional short code, e.g. DONATION" maxLength={30} />
    </FormDialog>
  );
}
