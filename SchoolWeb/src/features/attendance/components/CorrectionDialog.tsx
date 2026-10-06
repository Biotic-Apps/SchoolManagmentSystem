"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { ATTENDANCE_STATUS_LABEL, ATTENDANCE_STATUS_OPTIONS } from "../options";
import type { RegisterEntry } from "../types";
import { useCorrectionForm } from "../use-correction-form";

export function CorrectionDialog({ entry, onClose }: { entry: RegisterEntry; onClose: () => void }) {
  const { form, submit, submitting, formError } = useCorrectionForm(entry, onClose);
  const current = entry.status ? ATTENDANCE_STATUS_LABEL[entry.status] : "Unmarked";
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Request attendance correction"
      description={`${entry.name} is marked ${current.toLowerCase()}. The principal approves the change; the old mark stays in history.`}
      submitLabel="Send request"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <SelectField name="newStatus" label="Correct status" options={ATTENDANCE_STATUS_OPTIONS} required />
      <TextareaField name="reason" label="Reason" required placeholder="e.g. Arrived with a late slip from the gate" />
    </FormDialog>
  );
}
