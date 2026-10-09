"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { OrDivider } from "@/components/shared/OrDivider";
import { Button } from "@/components/ui/Button";
import { useLoginForm } from "../use-login-form";
import { AuthFooterLink } from "./AuthFooterLink";
import { AuthLayout } from "./AuthLayout";
import { EmailCodeLoginForm } from "./EmailCodeLoginForm";
import { LoginForm } from "./LoginForm";
import { TwoFactorLoginForm } from "./TwoFactorLoginForm";

export function LoginPanel() {
  const login = useLoginForm();
  const [withCode, setWithCode] = useState(false);
  const [otpChallengeId, setOtpChallengeId] = useState<string | null>(null);
  const challengeId = login.challengeId ?? otpChallengeId;

  if (challengeId) {
    const back = () => {
      setOtpChallengeId(null);
      login.backToPassword();
    };
    return (
      <AuthLayout title="Two-step verification" description="One more step to confirm it's you.">
        <TwoFactorLoginForm challengeId={challengeId} onBack={back} />
      </AuthLayout>
    );
  }
  if (withCode) {
    return (
      <AuthLayout
        title="Sign in with a code"
        description="For parents: we email a one-time code to the address the school has on record."
      >
        <EmailCodeLoginForm onChallenge={setOtpChallengeId} />
        <OrDivider />
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => setWithCode(false)}
        >
          Use username and password instead
        </Button>
      </AuthLayout>
    );
  }
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to your school account."
      footer={<AuthFooterLink href="/forgot-password">Forgot your password?</AuthFooterLink>}
    >
      <LoginForm login={login} />
      <OrDivider />
      <Button variant="ghost" size="lg" className="w-full" onClick={() => setWithCode(true)}>
        <Mail />
        Sign in with an email code
      </Button>
    </AuthLayout>
  );
}
