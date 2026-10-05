"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { TextField } from "@/components/shared/form/TextField";
import type { CreatedUser } from "../types";
import { useAssignmentOptions } from "../use-assignment-options";
import { useCreateUserForm } from "../use-create-user-form";
import { AssignmentsBuilder } from "./AssignmentsBuilder";

interface CreateUserDialogProps {
  onClose: () => void;
  onCreated: (user: CreatedUser) => void;
}

export function CreateUserDialog({ onClose, onCreated }: CreateUserDialogProps) {
  const { form, submit, submitting, formError } = useCreateUserForm(onCreated);
  const options = useAssignmentOptions();

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Add user"
      description="Principals and admin staff sign in with their email or phone."
      submitLabel="Create user"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="lg"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="name" label="Full name" required className="sm:col-span-2" />
        <TextField name="email" label="Email" type="email" autoComplete="off" />
        <TextField name="phone" label="Phone" type="tel" autoComplete="off" />
        <TextField
          name="password"
          label="Initial password"
          type="password"
          autoComplete="new-password"
          className="sm:col-span-2"
          hint="Optional. Leave empty to generate a temporary password; the user must change it at first sign-in."
        />
      </div>
      <AssignmentsBuilder options={options} />
    </FormDialog>
  );
}
