"use client";

import Link from "next/link";
import { FormProvider } from "react-hook-form";
import { FormAlert } from "@/components/shared/FormAlert";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { TextField } from "@/components/shared/form/TextField";
import { Button } from "@/components/ui/Button";
import { useForgotPasswordForm } from "../use-forgot-password-form";
import { AuthFooterLink } from "./AuthFooterLink";
import { AuthLayout } from "./AuthLayout";

export function ForgotPasswordPanel() {
  const { form, submit, submitting, formError, sent, again } = useForgotPasswordForm();

  return (
    <AuthLayout
      title="Reset your password"
      description="Enter the email or phone number you sign in with."
      footer={<AuthFooterLink href="/login">Back to sign in</AuthFooterLink>}
    >
      {sent ? (
        <div className="flex flex-col gap-5">
          <InlineNotice>
            If an account exists for that email or phone, we have sent instructions to reset the password. The code
            expires soon, so use it right away.
          </InlineNotice>
          <Button asChild size="lg" className="w-full">
            <Link href="/reset-password">I have a reset code</Link>
          </Button>
          <Button variant="ghost" size="sm" className="self-center" onClick={again}>
            Send again
          </Button>
        </div>
      ) : (
        <FormProvider {...form}>
          <form onSubmit={submit} noValidate className="flex flex-col gap-5">
            <FormAlert message={formError} />
            <TextField name="identifier" label="Email or phone" autoComplete="username" required />
            <Button type="submit" size="lg" loading={submitting} className="w-full">
              Send reset instructions
            </Button>
          </form>
        </FormProvider>
      )}
    </AuthLayout>
  );
}
