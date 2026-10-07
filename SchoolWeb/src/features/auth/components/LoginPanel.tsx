"use client";

import { useState } from "react";
import { Smartphone } from "lucide-react";
import { OrDivider } from "@/components/shared/OrDivider";
import { Button } from "@/components/ui/Button";
import { useLoginForm } from "../use-login-form";
import { AuthFooterLink } from "./AuthFooterLink";
import { AuthLayout } from "./AuthLayout";
import { LoginForm } from "./LoginForm";
import { PhoneLoginForm } from "./PhoneLoginForm";
import { TwoFactorLoginForm } from "./TwoFactorLoginForm";

export function LoginPanel() {
  const login = useLoginForm();
  const [withPhone, setWithPhone] = useState(false);
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
  if (withPhone) {
    return (
      <AuthLayout
        title="Sign in with phone code"
        description="For parents: we send a one-time code by SMS to your mobile number."
      >
        <PhoneLoginForm onChallenge={setOtpChallengeId} />
        <OrDivider />
        <Button variant="secondary" size="lg" className="w-full" onClick={() => setWithPhone(false)}>
          Sign in with password
        </Button>
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
      <OrDivider />
      <Button variant="secondary" size="lg" className="w-full" onClick={() => setWithPhone(true)}>
        <Smartphone />
        Sign in with phone code
      </Button>
    </AuthLayout>
  );
}
