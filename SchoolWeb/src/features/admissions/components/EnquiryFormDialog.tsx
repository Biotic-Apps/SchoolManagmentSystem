"use client";

import type { Option } from "@/components/shared/OptionSelect";
import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { TextField } from "@/components/shared/form/TextField";
import { SOURCE_SUGGESTIONS } from "../options";
import { useEnquiryForm, type EnquiryFormContext } from "../use-enquiry-form";

interface EnquiryFormDialogProps {
  context: EnquiryFormContext;
  classOptions: Option[];
  onClose: () => void;
}

export function EnquiryFormDialog({ context, classOptions, onClose }: EnquiryFormDialogProps) {
  const { form, submit, submitting, formError } = useEnquiryForm(context, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Add enquiry"
      description="Saved for the selected branch and session."
      submitLabel="Add enquiry"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="lg"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="childName" label="Child's name" required />
        <SelectField name="classId" label="Class applying for" options={classOptions} required />
        <TextField name="dob" label="Date of birth" type="date" />
        <TextField name="guardianName" label="Guardian's name" required />
        <TextField name="phone" label="Phone" type="tel" required />
        <TextField name="email" label="Email" type="email" />
        <TextField name="source" label="Source" placeholder={SOURCE_SUGGESTIONS} />
        <TextField name="followUpDate" label="Follow-up date" type="date" />
        <TextareaField name="notes" label="Notes" className="sm:col-span-2" />
      </div>
    </FormDialog>
  );
}
