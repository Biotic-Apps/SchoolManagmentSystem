"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { placementLabel } from "../options";
import type { StudentDetail } from "../types";
import { useChangeSectionForm } from "../use-change-section-form";

export function ChangeSectionDialog({ student, onClose }: { student: StudentDetail; onClose: () => void }) {
  const { form, submit, submitting, formError, options, loadingOptions } = useChangeSectionForm(student, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Change section of ${student.name}`}
      description={`Currently in ${placementLabel(student.className, student.sectionName)}. Sections of the same branch and session; a new roll number is assigned.`}
      submitLabel="Change section"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <SelectField
        name="sectionId"
        label="New section"
        options={options}
        placeholder={loadingOptions ? "Loading sections" : "Select"}
        required
      />
      <TextField name="effectiveDate" label="Effective date" type="date" required />
      <TextareaField name="reason" label="Reason" rows={3} required />
    </FormDialog>
  );
}
