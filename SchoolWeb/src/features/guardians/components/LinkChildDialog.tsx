"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { FormField } from "@/components/shared/FormField";
import { SearchPicker } from "@/components/shared/SearchPicker";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { SelectField } from "@/components/shared/form/SelectField";
import { RELATION_OPTIONS } from "@/features/people/options";
import type { GuardianDetail } from "../types";
import { useLinkChildForm } from "../use-link-child-form";

interface LinkChildDialogProps {
  guardian: GuardianDetail;
  branchId: string | null;
  onClose: () => void;
}

export function LinkChildDialog({ guardian, branchId, onClose }: LinkChildDialogProps) {
  const { form, submit, submitting, formError, picker, pickerError } = useLinkChildForm(guardian, branchId, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Link a child to ${guardian.name}`}
      description="Links added by staff are verified immediately."
      submitLabel="Link child"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <FormField
        id="link-child-search"
        label="Student"
        required
        error={pickerError ? { type: "required", message: pickerError } : undefined}
      >
        <SearchPicker id="link-child-search" placeholder="Search name or admission no" {...picker} />
      </FormField>
      <SelectField name="relation" label="Relation to student" options={RELATION_OPTIONS} required />
      <CheckboxField name="isPrimary" label="Primary contact" hint="Replaces the student's current primary guardian." />
    </FormDialog>
  );
}
