"use client";

import type { Option } from "@/components/shared/OptionSelect";
import { FormDialog } from "@/components/shared/FormDialog";
import { FormSection } from "@/components/shared/FormSection";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { ChildFields } from "@/features/people/components/ChildFields";
import { GuardiansRepeater } from "@/features/people/components/GuardiansRepeater";
import { useRegisterStudentForm } from "../use-register-student-form";

interface RegisterStudentDialogProps {
  scope: { branchId: string; sessionId: string; classId: string | undefined };
  classOptions: Option[];
  onClose: () => void;
}

export function RegisterStudentDialog({ scope, classOptions, onClose }: RegisterStudentDialogProps) {
  const { form, submit, submitting, formError, sections, sectionFull } = useRegisterStudentForm(scope);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Register student"
      description="Direct registration without an admission application. An admission number is assigned automatically."
      submitLabel="Register student"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="xl"
    >
      <FormSection title="Child">
        <ChildFields prefix="child" />
      </FormSection>
      <FormSection title="Guardians" description="At least one guardian; exactly one is the primary contact.">
        <GuardiansRepeater />
      </FormSection>
      <FormSection title="Placement" description="Section of the selected branch session.">
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField name="classId" label="Class" options={classOptions} emptyLabel="All classes" />
          <SelectField
            name="sectionId"
            label="Section"
            options={sections.options}
            placeholder={sections.isLoading ? "Loading sections" : "Select"}
            required
          />
          <TextField name="admissionDate" label="Admission date" type="date" required />
        </div>
        {sectionFull && <InlineNotice tone="warning">This section is at capacity.</InlineNotice>}
      </FormSection>
    </FormDialog>
  );
}
