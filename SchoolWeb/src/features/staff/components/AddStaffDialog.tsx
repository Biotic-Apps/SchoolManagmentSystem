"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { FormSection } from "@/components/shared/FormSection";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { SelectField } from "@/components/shared/form/SelectField";
import { STAFF_ROLE_OPTIONS } from "../options";
import type { CreatedStaff } from "../types";
import { useStaffForm } from "../use-staff-form";
import { StaffProfileFields } from "./StaffProfileFields";

interface AddStaffDialogProps {
  branchId: string;
  onClose: () => void;
  onCreated: (created: CreatedStaff) => void;
}

export function AddStaffDialog({ branchId, onClose, onCreated }: AddStaffDialogProps) {
  const { form, submit, submitting, formError, createAccount } = useStaffForm(branchId, onCreated);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Add staff"
      description="Teachers, helpers and office staff of this branch."
      submitLabel="Add staff"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="lg"
    >
      <StaffProfileFields />
      <FormSection title="Sign-in account" description="Staff with an account can use the app with their email or phone.">
        <CheckboxField
          name="createAccount"
          label="Create sign-in account"
          hint="A temporary password is generated; it must be changed at first sign-in."
        />
        {createAccount && <SelectField name="roleKey" label="Account role" options={STAFF_ROLE_OPTIONS} required />}
      </FormSection>
    </FormDialog>
  );
}
