"use client";

import { FormAlert } from "@/components/shared/FormAlert";
import { FormField, errorId } from "@/components/shared/FormField";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { useLoginForm } from "../use-login-form";

export function LoginForm({ login }: { login: ReturnType<typeof useLoginForm> }) {
  const { register, errors, submit, submitting, serverError, notice } = login;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {notice && <InlineNotice>{notice}</InlineNotice>}
      <FormAlert message={serverError} />
      <FormField
        id="identifier"
        label="Email, phone or admission number"
        hint="Parents can use their child’s admission number, e.g. SMS-2026-0002."
        error={errors.identifier}
      >
        <Input
          id="identifier"
          autoComplete="username"
          autoFocus
          aria-invalid={!!errors.identifier}
          aria-describedby={errors.identifier ? errorId("identifier") : undefined}
          {...register("identifier")}
        />
      </FormField>
      <FormField id="password" label="Password" error={errors.password}>
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
