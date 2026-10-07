"use client";

import { FormProvider } from "react-hook-form";
import { FormAlert } from "@/components/shared/FormAlert";
import { TextField } from "@/components/shared/form/TextField";
import { Button } from "@/components/ui/Button";
import type { useOtpLogin } from "../use-otp-login";

export function OtpPhoneStep({ phoneForm }: { phoneForm: ReturnType<typeof useOtpLogin>["phoneForm"] }) {
  const { form, submit, submitting, formError } = phoneForm;

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <FormAlert message={formError} />
        <TextField
          name="phone"
          label="Mobile number"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          autoFocus
          hint="The number the school has on record for you."
          required
        />
        <Button type="submit" size="lg" loading={submitting} className="w-full">
          Send code
        </Button>
      </form>
    </FormProvider>
  );
}
