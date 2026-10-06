"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { TextField } from "@/components/shared/form/TextField";
import type { Application } from "../types";
import { useTestResultForm } from "../use-application-action-forms";

export function TestResultDialog({ app, onClose }: { app: Application; onClose: () => void }) {
  const { form, submit, submitting, formError } = useTestResultForm(app, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Record test result"
      submitLabel="Save result"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="score" label="Score" inputMode="decimal" required />
        <TextField name="maxScore" label="Total marks" inputMode="decimal" required />
        <TextareaField name="remarks" label="Remarks" rows={3} className="sm:col-span-2" />
      </div>
    </FormDialog>
  );
}
