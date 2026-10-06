"use client";

import { FormProvider } from "react-hook-form";
import { FormAlert } from "@/components/shared/FormAlert";
import { TextField } from "@/components/shared/form/TextField";
import { Button } from "@/components/ui/Button";
import { useResetPasswordForm } from "../use-reset-password-form";
import { AuthFooterLink } from "./AuthFooterLink";
import { AuthLayout } from "./AuthLayout";
import { PasswordHints } from "./PasswordHints";

export function ResetPasswordPanel() {
  const { form, submit, submitting, formError, hasLinkToken, newPassword } = useResetPasswordForm();

  return (
    <AuthLayout
      title="Choose a new password"
      description="Setting a new password signs you out on every device."
      footer={<AuthFooterLink href="/login">Back to sign in</AuthFooterLink>}
    >
      <FormProvider {...form}>
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          <FormAlert message={formError} />
          {!hasLinkToken && <TextField name="token" label="Reset code" autoComplete="one-time-code" required />}
          <div className="flex flex-col gap-2">
            <TextField name="newPassword" label="New password" type="password" autoComplete="new-password" required />
            <PasswordHints value={newPassword ?? ""} />
          </div>
          <TextField name="confirmPassword" label="Repeat new password" type="password" autoComplete="new-password" required />
          <Button type="submit" size="lg" loading={submitting} className="w-full">
            Set new password
          </Button>
        </form>
      </FormProvider>
    </AuthLayout>
  );
}
