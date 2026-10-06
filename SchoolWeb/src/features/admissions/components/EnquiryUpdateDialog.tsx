"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { TextField } from "@/components/shared/form/TextField";
import { ENQUIRY_STATUS_OPTIONS, ENQUIRY_UPDATE_STATUS_OPTIONS } from "../options";
import type { Enquiry } from "../types";
import { useEnquiryUpdateForm } from "../use-enquiry-update-form";

export function EnquiryUpdateDialog({ item, onClose }: { item: Enquiry; onClose: () => void }) {
  const { form, submit, submitting, formError } = useEnquiryUpdateForm(item, onClose);
  const converted = item.status === "CONVERTED";

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Update enquiry for ${item.childName}`}
      description={`${item.guardianName} · ${item.phone}`}
      submitLabel="Save changes"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <SelectField
        name="status"
        label="Status"
        options={converted ? ENQUIRY_STATUS_OPTIONS : ENQUIRY_UPDATE_STATUS_OPTIONS}
        disabled={converted}
        hint={converted ? "Converted enquiries keep their status." : undefined}
        required
      />
      <TextField name="followUpDate" label="Follow-up date" type="date" />
      <TextareaField name="notes" label="Notes" rows={4} />
    </FormDialog>
  );
}
