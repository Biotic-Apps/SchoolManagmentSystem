"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FormAlert } from "@/components/shared/FormAlert";
import { FormField, errorId } from "@/components/shared/FormField";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { useLoginForm } from "../use-login-form";

export function LoginForm({ login }: { login: ReturnType<typeof useLoginForm> }) {
  const { register, errors, submit, submitting, serverError, notice } = login;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {notice && <InlineNotice>{notice}</InlineNotice>}
      <FormAlert message={serverError} />
      <FormField
        id="identifier"
        label="Username"
        error={errors.identifier}
      >
        <Input
          id="identifier"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Email, phone or admission no."
          autoFocus
          aria-invalid={!!errors.identifier}
          aria-describedby={errors.identifier ? errorId("identifier") : undefined}
          {...register("identifier")}
        />
      </FormField>
      <FormField id="password" label="Password" error={errors.password}>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="pr-10"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? errorId("password") : undefined}
            {...register("password")}
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-fg-muted hover:text-fg transition-colors"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </FormField>
      <Button type="submit" size="lg" loading={submitting} className="mt-1 w-full">
        Sign in
      </Button>
    </form>
  );
}
