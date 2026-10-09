import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { errorMessage } from "@/lib/error-messages";
import { useServerForm } from "@/lib/use-server-form";
import { requestLoginCode } from "./api";
import { otpEmailSchema, type OtpEmailValues } from "./schemas";
import { useResendCountdown } from "./use-resend-countdown";

/**
 * Email-code sign-in step 1 (parents): ask for a code. The API answers the
 * same for every address, so the code step always follows.
 */
export function useOtpLogin() {
  const [email, setEmail] = useState<string | null>(null);
  /** Only from a local development API (OTP_DEV_ECHO); never in production. */
  const [devCode, setDevCode] = useState<string | null>(null);
  const countdown = useResendCountdown();
  const emailForm = useServerForm<OtpEmailValues, Awaited<ReturnType<typeof requestLoginCode>>>({
    schema: otpEmailSchema,
    defaultValues: { email: "" },
    onSubmit: ({ email: value }) => requestLoginCode(value),
    onSuccess: (result, values) => {
      setEmail(values.email.trim().toLowerCase());
      setDevCode(result.data.devCode ?? null);
      countdown.start(result.data.resendAfterSeconds);
    },
  });
  const resend = useMutation({
    mutationFn: (value: string) => requestLoginCode(value),
    onSuccess: (result) => {
      setDevCode(result.data.devCode ?? null);
      countdown.start(result.data.resendAfterSeconds);
    },
  });

  return {
    emailForm,
    email,
    devCode,
    secondsLeft: countdown.secondsLeft,
    resend: () => email && resend.mutate(email),
    resending: resend.isPending,
    resent: resend.isSuccess,
    resendError: resend.error ? errorMessage(resend.error) : null,
    changeEmail: () => {
      setEmail(null);
      setDevCode(null);
      resend.reset();
    },
  };
}
