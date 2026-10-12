"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import type { Option } from "@/components/shared/OptionSelect";
import { useGenerateForm } from "../use-generate-form";
import type { HrLetter, HrLetterTemplate } from "../types";

interface GenerateLetterDialogProps {
  staffId: string;
  templates: HrLetterTemplate[];
  onClose: () => void;
  onSaved: (letter: HrLetter) => void;
}

export function GenerateLetterDialog({ staffId, templates, onClose, onSaved }: GenerateLetterDialogProps) {
  const generate = useGenerateForm(staffId, onSaved);

  const templateOptions: Option[] = templates.map((t) => ({ id: t.id, name: t.title }));

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Generate HR letter"
      submitLabel="Generate"
      submitting={generate.submitting}
      onSubmit={generate.submit}
      form={generate.form}
      error={generate.formError}
    >
      <SelectField name="templateId" label="Template" options={templateOptions} required />
      <TextField name="subject" label="Subject (optional)" maxLength={200} placeholder="Auto-generated if left blank" />
      <TextField name="effectiveDate" label="Effective date (optional)" placeholder="YYYY-MM-DD" />
    </FormDialog>
  );
}
