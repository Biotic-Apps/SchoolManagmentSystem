"use client";

import { FormProvider } from "react-hook-form";
import { FormAlert } from "@/components/shared/FormAlert";
import { TextField } from "@/components/shared/form/TextField";
import { Button } from "@/components/ui/Button";
import type { useOtpLogin } from "../use-otp-login";

export function OtpEmailStep({ emailForm }: { emailForm: ReturnType<typeof useOtpLogin>["emailForm"] }) {
  const { form, submit, submitting, formError } = emailForm;

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <FormAlert message={formError} />
        <TextField
          name="email"
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          autoFocus
          hint="The email address the school has on record for you."
          required
        />
        <Button type="submit" size="lg" loading={submitting} className="w-full">
          Send code
        </Button>
      </form>
    </FormProvider>
  );
}
