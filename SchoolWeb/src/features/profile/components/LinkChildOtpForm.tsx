"use client";

import { FormProvider } from "react-hook-form";
import { FormAlert } from "@/components/shared/FormAlert";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { TextField } from "@/components/shared/form/TextField";
import { Button } from "@/components/ui/Button";
import type { ChildLinkStarted } from "@/features/guardians/types";
import type { useLinkChild } from "../use-link-child";

type OtpForm = ReturnType<typeof useLinkChild>["otp"];

interface LinkChildOtpFormProps {
  form: OtpForm;
  started: ChildLinkStarted;
  onBack: () => void;
}

export function LinkChildOtpForm({ form: { form, submit, submitting, formError }, started, onBack }: LinkChildOtpFormProps) {
  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <FormAlert message={formError} />
        <p className="text-label text-fg">We sent a code to {started.maskedPhone}.</p>
        {started.devCode && <InlineNotice tone="info">Development code: {started.devCode}</InlineNotice>}
        <TextField
          name="code"
          label="Verification code"
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          className="sm:w-56"
        />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" loading={submitting}>
            Verify and send request
          </Button>
          <Button variant="ghost" onClick={onBack} disabled={submitting}>
            Start over
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
