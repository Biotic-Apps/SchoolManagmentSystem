"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import { OrDivider } from "@/components/shared/OrDivider";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { Button } from "@/components/ui/Button";
import { LOGIN_ROLE_OPTIONS, type LoginRole } from "../login-role";
import { useLoginForm } from "../use-login-form";
import { AuthFooterLink } from "./AuthFooterLink";
import { AuthLayout } from "./AuthLayout";
import { EmailCodeLoginForm } from "./EmailCodeLoginForm";
import { LoginForm } from "./LoginForm";
import { TwoFactorLoginForm } from "./TwoFactorLoginForm";

export function LoginPanel() {
  const login = useLoginForm();
  const params = useSearchParams();
  const [role, setRole] = useState<LoginRole>(params.get("role") === "parent" ? "parent" : "staff");
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
          onClick={() => {
            setRole("parent");
            setWithCode(false);
          }}
        >
          Use admission number and password instead
        </Button>
      </AuthLayout>
    );
  }
  return (
    <AuthLayout
      title="Sign in"
      description={
        role === "parent"
          ? "Use the username and password on the login slip from your child’s school."
          : "Use the account your school administrator created for you."
      }
      footer={role === "staff" && <AuthFooterLink href="/forgot-password">Forgot your password?</AuthFooterLink>}
    >
      <SegmentedControl
        label="I am"
        options={LOGIN_ROLE_OPTIONS}
        value={role}
        onChange={(value) => setRole(value as LoginRole)}
        className="mb-6 w-full"
      />
      <LoginForm login={login} role={role} />
      <OrDivider />
      <Button variant="ghost" size="lg" className="w-full" onClick={() => setWithCode(true)}>
        <Mail />
        {role === "parent" ? "Sign in with an email code instead" : "Parents: sign in with a code instead"}
      </Button>
    </AuthLayout>
  );
}
