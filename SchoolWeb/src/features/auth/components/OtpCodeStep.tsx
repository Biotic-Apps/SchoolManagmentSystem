"use client";

import { FormAlert } from "@/components/shared/FormAlert";
import { FormField, errorId } from "@/components/shared/FormField";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { useOtpLogin } from "../use-otp-login";
import { useOtpCodeForm } from "../use-otp-code-form";

interface OtpCodeStepProps {
  otp: ReturnType<typeof useOtpLogin> & { email: string };
  onChallenge: (challengeId: string) => void;
}

export function OtpCodeStep({ otp, onChallenge }: OtpCodeStepProps) {
  const { register, errors, submit, submitting, serverError } = useOtpCodeForm(otp.email, onChallenge);
  const waiting = otp.secondsLeft > 0;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <p className="text-label text-fg-muted">
        If <span className="font-medium text-fg">{otp.email}</span> belongs to a parent account, a 6-digit code is on
        its way by email. It expires in 5 minutes. Not there? Check your spam folder.
      </p>
      {otp.resent && !otp.resendError && <InlineNotice>A new code was requested. Earlier codes no longer work.</InlineNotice>}
      <FormAlert message={serverError ?? otp.resendError} />
      <FormField id="code" label="Code from the email" error={errors.code}>
        <Input
          id="code"
          autoFocus
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={7}
          aria-invalid={!!errors.code}
          aria-describedby={errors.code ? errorId("code") : undefined}
          {...register("code")}
        />
      </FormField>
      <Button type="submit" size="lg" loading={submitting} className="w-full">
        Verify and sign in
      </Button>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={otp.changeEmail} disabled={submitting}>
          Change email
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={otp.resend}
          loading={otp.resending}
          disabled={submitting || waiting}
        >
          {waiting ? `Resend in ${otp.secondsLeft} s` : "Resend code"}
        </Button>
      </div>
    </form>
  );
}
