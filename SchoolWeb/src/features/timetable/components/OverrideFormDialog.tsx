"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { useOverrideForm } from "../use-override-form";

interface OverrideFormDialogProps {
  branchId: string;
  sessionId: string | null;
  date: string;
  onClose: () => void;
}

export function OverrideFormDialog({ branchId, sessionId, date, onClose }: OverrideFormDialogProps) {
  const { form, submit, submitting, formError, ...options } = useOverrideForm(branchId, sessionId, date, onClose);
  const placeholder = options.loading ? "Loading" : "Select";

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Assign substitute"
      description="The substitute teacher is notified and sees the period in their week."
      submitLabel="Assign substitute"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField name="sectionId" label="Class section" options={options.sectionOptions} placeholder={placeholder} required />
        <TextField name="date" label="Date" type="date" required />
        <SelectField name="periodIndex" label="Period" options={options.periodOptions} placeholder={placeholder} required />
        <SelectField
          name="substituteStaffId"
          label="Substitute teacher"
          options={options.teacherOptions}
          placeholder={placeholder}
          required
        />
      </div>
      <TextareaField name="reason" label="Reason" required placeholder="e.g. Class teacher on leave" />
    </FormDialog>
  );
}
