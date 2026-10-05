"use client";

import { FormProvider } from "react-hook-form";
import { FormAlert } from "@/components/shared/FormAlert";
import { TextField } from "@/components/shared/form/TextField";
import { Button } from "@/components/ui/Button";
import { useChangePasswordForm } from "../use-change-password-form";

const PASSWORD_HINT = "At least 8 characters with a letter and a digit.";

export function ChangePasswordForm({ onDone, submitLabel = "Change password" }: { onDone?: () => void; submitLabel?: string }) {
  const { form, submit, submitting, formError } = useChangePasswordForm(onDone);

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <FormAlert message={formError} />
        <TextField name="currentPassword" label="Current password" type="password" autoComplete="current-password" required />
        <TextField
          name="newPassword"
          label="New password"
          type="password"
          autoComplete="new-password"
          hint={PASSWORD_HINT}
          required
        />
        <TextField name="confirmPassword" label="Repeat new password" type="password" autoComplete="new-password" required />
        <Button type="submit" loading={submitting} className="self-start">
          {submitLabel}
        </Button>
      </form>
    </FormProvider>
  );
}
