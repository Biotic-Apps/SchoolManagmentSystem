"use client";

import { FormAlert } from "@/components/shared/FormAlert";
import { FormField, errorId } from "@/components/shared/FormField";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTwoFactorLogin } from "../use-two-factor-login";

interface TwoFactorLoginFormProps {
  challengeId: string;
  onBack: () => void;
}

export function TwoFactorLoginForm({ challengeId, onBack }: TwoFactorLoginFormProps) {
  const { register, errors, mode, toggleMode, submit, submitting, serverError } = useTwoFactorLogin(challengeId);
  const totp = mode === "totp";

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <p className="text-label text-fg-muted">
        {totp
          ? "Open your authenticator app and enter the 6-digit code for eSchool."
          : "Enter one of the recovery codes you saved when you turned on two-step sign-in. Each code works once."}
      </p>
      <FormAlert message={serverError} />
      <FormField id="code" label={totp ? "Authentication code" : "Recovery code"} error={errors.code}>
        <Input
          key={mode}
          id="code"
          autoFocus
          autoComplete="one-time-code"
          inputMode={totp ? "numeric" : "text"}
          maxLength={totp ? 7 : 64}
          aria-invalid={!!errors.code}
          aria-describedby={errors.code ? errorId("code") : undefined}
          {...register("code")}
        />
      </FormField>
      <Button type="submit" size="lg" loading={submitting} className="w-full">
        Verify and sign in
      </Button>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onBack} disabled={submitting}>
          Back
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={toggleMode} disabled={submitting}>
          {totp ? "Use a recovery code" : "Use the authenticator app"}
        </Button>
      </div>
    </form>
  );
}
