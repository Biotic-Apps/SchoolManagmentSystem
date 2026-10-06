"use client";

import { useLoginForm } from "../use-login-form";
import { AuthFooterLink } from "./AuthFooterLink";
import { AuthLayout } from "./AuthLayout";
import { LoginForm } from "./LoginForm";
import { TwoFactorLoginForm } from "./TwoFactorLoginForm";

export function LoginPanel() {
  const login = useLoginForm();

  if (login.challengeId) {
    return (
      <AuthLayout title="Two-step verification" description="One more step to confirm it's you.">
        <TwoFactorLoginForm challengeId={login.challengeId} onBack={login.backToPassword} />
      </AuthLayout>
    );
  }
  return (
    <AuthLayout
      title="Sign in"
      description="Use the account your school administrator created for you."
      footer={<AuthFooterLink href="/forgot-password">Forgot your password?</AuthFooterLink>}
    >
      <LoginForm login={login} />
    </AuthLayout>
  );
}
