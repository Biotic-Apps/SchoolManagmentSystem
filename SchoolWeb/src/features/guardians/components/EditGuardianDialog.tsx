"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { GuardianFields } from "@/features/people/components/GuardianFields";
import type { Guardian } from "../types";
import { useEditGuardianForm } from "../use-edit-guardian-form";

export function EditGuardianDialog({ guardian, onClose }: { guardian: Guardian; onClose: () => void }) {
  const { form, submit, submitting, formError } = useEditGuardianForm(guardian, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Edit ${guardian.name}`}
      submitLabel="Save changes"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="lg"
    >
      <GuardianFields prefix="guardian" cnicHint="Leave blank to keep the current CNIC." />
    </FormDialog>
  );
}
