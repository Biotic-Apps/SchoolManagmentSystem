"use client";

import { useOtpLogin } from "../use-otp-login";
import { OtpCodeStep } from "./OtpCodeStep";
import { OtpEmailStep } from "./OtpEmailStep";

/** Parents: email address → emailed code → same post-login flow as the password form. */
export function EmailCodeLoginForm({ onChallenge }: { onChallenge: (challengeId: string) => void }) {
  const otp = useOtpLogin();
  const { email } = otp;
  if (email)
    return <OtpCodeStep key={email} otp={{ ...otp, email }} onChallenge={onChallenge} />;
  return <OtpEmailStep emailForm={otp.emailForm} />;
}
