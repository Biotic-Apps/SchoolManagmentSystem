"use client";

import { useState } from "react";
import { FormDialog } from "@/components/shared/FormDialog";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { STAFF_ROLE_OPTIONS } from "../options";
import type { StaffAccount, StaffDetail } from "../types";
import { useStaffAccountForm } from "../use-staff-account-form";
import { SignInResultDialog } from "./SignInResultDialog";

interface CreateSignInDialogProps {
  staff: StaffDetail;
  onClose: () => void;
}

export function CreateSignInDialog({ staff, onClose }: CreateSignInDialogProps) {
  const [account, setAccount] = useState<StaffAccount | null>(null);
  const form = useStaffAccountForm(staff, setAccount);

  if (account) {
    return (
      <SignInResultDialog
        title={`${staff.name} can now sign in`}
        description="They sign in to the app or website with their email or phone."
        name={staff.name}
        email={account.email}
        phone={account.phone}
        temporaryPassword={account.temporaryPassword}
        onClose={onClose}
      />
    );
  }

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Create sign-in"
      description={`Lets ${staff.name} use the app with their email or phone. At least one is needed.`}
      submitLabel="Create sign-in"
      submitting={form.submitting}
      onSubmit={form.submit}
      form={form.form}
      error={form.formError}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="email" label="Email" type="email" autoComplete="off" placeholder="name@school.edu.pk" />
        <TextField name="phone" label="Phone" type="tel" autoComplete="off" placeholder="+92 300 1234567" />
      </div>
      <SelectField
        name="roleKey"
        label="Account role"
        options={STAFF_ROLE_OPTIONS}
        required
        hint="What they can do after signing in. Set from the designation."
      />
      <CheckboxField
        name="setPassword"
        label="Set password myself"
        hint="Otherwise a temporary password is created; they choose their own at first sign-in."
      />
      {form.setPassword && (
        <TextField
          name="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          hint="At least 8 characters with a letter and a digit"
        />
      )}
    </FormDialog>
  );
}
