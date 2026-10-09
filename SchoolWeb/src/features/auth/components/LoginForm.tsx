"use client";

import { FormAlert } from "@/components/shared/FormAlert";
import { FormField, errorId } from "@/components/shared/FormField";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { LoginRole } from "../login-role";
import type { useLoginForm } from "../use-login-form";

const IDENTIFIER = {
  staff: { label: "Email, phone or username", placeholder: "you@school.pk", hint: undefined },
  parent: {
    label: "Child’s admission no., phone or email",
    placeholder: "e.g. BRIGHT-2026-0002",
    hint: "On the login slip from the school.",
  },
} as const;

export function LoginForm({ login, role }: { login: ReturnType<typeof useLoginForm>; role: LoginRole }) {
  const { register, errors, submit, submitting, serverError, notice } = login;
  const identifier = IDENTIFIER[role];

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {notice && <InlineNotice>{notice}</InlineNotice>}
      <FormAlert message={serverError} />
      <FormField
        id="identifier"
        label={identifier.label}
        hint={identifier.hint}
        error={errors.identifier}
      >
        <Input
          id="identifier"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={identifier.placeholder}
          autoFocus
          aria-invalid={!!errors.identifier}
          aria-describedby={errors.identifier ? errorId("identifier") : undefined}
          {...register("identifier")}
        />
      </FormField>
      <FormField
        id="password"
        label="Password"
        hint={role === "parent" ? "Forgot your password? Ask the school office to reset it." : undefined}
        error={errors.password}
      >
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? errorId("password") : undefined}
          {...register("password")}
        />
      </FormField>
      <Button type="submit" size="lg" loading={submitting} className="mt-1 w-full">
        Sign in
      </Button>
    </form>
  );
}
