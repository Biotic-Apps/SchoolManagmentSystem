"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { GENDER_OPTIONS } from "@/features/people/options";
import type { Application, Enquiry } from "../types";
import { useConvertEnquiryForm } from "../use-convert-enquiry-form";

interface ConvertEnquiryDialogProps {
  item: Enquiry;
  onClose: () => void;
  onConverted: (application: Application) => void;
}

export function ConvertEnquiryDialog({ item, onClose, onConverted }: ConvertEnquiryDialogProps) {
  const { form, submit, submitting, formError } = useConvertEnquiryForm(item, onConverted);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Convert ${item.childName} to an application?`}
      description="An application is created from this enquiry. Complete the child and guardian details on it next."
      submitLabel="Convert"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <SelectField name="gender" label="Gender" options={GENDER_OPTIONS} required />
      <TextField
        name="dob"
        label="Date of birth"
        type="date"
        required={!item.dob}
        hint={item.dob ? "Taken from the enquiry; change it if needed." : undefined}
      />
    </FormDialog>
  );
}
