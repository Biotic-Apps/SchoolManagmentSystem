"use client";

import { useOtpLogin } from "../use-otp-login";
import { OtpCodeStep } from "./OtpCodeStep";
import { OtpPhoneStep } from "./OtpPhoneStep";

/** Parents: mobile number → SMS code → same post-login flow as the password form. */
export function PhoneLoginForm({ onChallenge }: { onChallenge: (challengeId: string) => void }) {
  const otp = useOtpLogin();
  const { phone } = otp;
  if (phone) return <OtpCodeStep key={phone} otp={{ ...otp, phone }} onChallenge={onChallenge} />;
  return <OtpPhoneStep phoneForm={otp.phoneForm} />;
}
