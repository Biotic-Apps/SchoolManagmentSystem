"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import type { StaffDetail } from "../types";
import { useStatusForm } from "../use-status-form";

export function StaffStatusDialog({ staff, onClose }: { staff: StaffDetail; onClose: () => void }) {
  const { form, submit, submitting, formError, statusOptions, leaving } = useStatusForm(staff, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Change status of ${staff.name}`}
      submitLabel="Change status"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField name="status" label="New status" options={statusOptions} required />
        <TextField name="effectiveDate" label="Effective from" type="date" required />
        <TextareaField name="reason" label="Reason" required className="sm:col-span-2" />
      </div>
      {leaving && (
        <InlineNotice tone="warning">
          This disables the staff member&apos;s sign-in account and ends all their class and subject assignments. The
          history is kept.
        </InlineNotice>
      )}
    </FormDialog>
  );
}
