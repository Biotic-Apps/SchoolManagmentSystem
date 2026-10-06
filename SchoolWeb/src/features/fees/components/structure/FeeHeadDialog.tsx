"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { FEE_HEAD_KIND_OPTIONS } from "../../structure-options";
import { useFeeHeadForm } from "../../use-fee-head-form";

export function FeeHeadDialog({ schoolId, onClose }: { schoolId: string | null; onClose: () => void }) {
  const { form, submit, submitting, formError } = useFeeHeadForm(schoolId, onClose);
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Add fee head"
      description="Available to every branch of this school."
      submitLabel="Add fee head"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="code" label="Code" required placeholder="e.g. TUITION" />
        <TextField name="name" label="Name" required placeholder="e.g. Tuition fee" />
        <SelectField name="kind" label="Kind" options={FEE_HEAD_KIND_OPTIONS} required className="sm:col-span-2" />
      </div>
      <CheckboxField name="refundable" label="Refundable" hint="Can be refunded when a student leaves." />
    </FormDialog>
  );
}
