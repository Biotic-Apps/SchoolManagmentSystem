"use client";

import type { Option } from "@/components/shared/OptionSelect";
import { FormDialog } from "@/components/shared/FormDialog";
import { FormSection } from "@/components/shared/FormSection";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { StagedDocumentsField } from "@/features/documents/components/StagedDocumentsField";
import { ChildFields } from "@/features/people/components/ChildFields";
import { GuardiansRepeater } from "@/features/people/components/GuardiansRepeater";
import { MedicalFields } from "@/features/people/components/MedicalFields";
import type { Application } from "../types";
import { useApplicationForm, type ApplicationFormContext } from "../use-application-form";

interface ApplicationFormDialogProps {
  item: Application | null;
  context: ApplicationFormContext;
  classOptions: Option[];
  onClose: () => void;
  onSaved?: (application: Application) => void;
}

export function ApplicationFormDialog({ item, context, classOptions, onClose, onSaved }: ApplicationFormDialogProps) {
  const done = (application: Application) => {
    onClose();
    onSaved?.(application);
  };
  const { form, submit, submitting, formError } = useApplicationForm(item, context, done);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={item ? `Edit application ${item.applicationNo}` : "New application"}
      submitLabel={item ? "Save changes" : "Submit application"}
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="xl"
    >
      <FormSection title="Class">
        <SelectField name="classId" label="Class applying for" options={classOptions} required className="sm:w-80" />
      </FormSection>
      <FormSection title="Child">
        <ChildFields prefix="child" />
      </FormSection>
      <FormSection title="Parents & guardians" description="Mark exactly one guardian as the primary contact.">
        <GuardiansRepeater />
      </FormSection>
      <FormSection title="Medical" description="Optional. Shared with staff who care for the child.">
        <MedicalFields prefix="medical" />
      </FormSection>
      {!item && (
        <FormSection title="Documents" description="Optional. Birth certificate, B-Form, previous results and so on.">
          <StagedDocumentsField />
        </FormSection>
      )}
      <FormSection title="Notes">
        <TextareaField name="notes" label="Notes" rows={3} />
      </FormSection>
    </FormDialog>
  );
}
