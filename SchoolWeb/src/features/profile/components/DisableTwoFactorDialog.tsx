"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { TextField } from "@/components/shared/form/TextField";
import { useDisableTwoFactorForm } from "../use-disable-two-factor-form";

interface DisableTwoFactorDialogProps {
  onClose: () => void;
  onDisabled: () => void;
}

export function DisableTwoFactorDialog({ onClose, onDisabled }: DisableTwoFactorDialogProps) {
  const { form, submit, submitting, formError } = useDisableTwoFactorForm(onDisabled);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Turn off two-step sign-in?"
      description="Your account will be protected by your password only. Confirm with your password and a code."
      submitLabel="Turn off"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <TextField name="password" label="Password" type="password" autoComplete="current-password" required />
      <TextField
        name="code"
        label="Code from the app or a recovery code"
        autoComplete="one-time-code"
        maxLength={64}
        required
      />
    </FormDialog>
  );
}
