"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { TextField } from "@/components/shared/form/TextField";
import type { UserSummary } from "../types";
import { useEditUserForm } from "../use-edit-user-form";

export function EditUserDialog({ user, onClose }: { user: UserSummary; onClose: () => void }) {
  const { form, submit, submitting, formError } = useEditUserForm(user, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Edit ${user.name}`}
      submitLabel="Save changes"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <TextField name="name" label="Full name" required />
      <TextField name="email" label="Email" type="email" autoComplete="off" />
      <TextField name="phone" label="Phone" type="tel" autoComplete="off" />
    </FormDialog>
  );
}
