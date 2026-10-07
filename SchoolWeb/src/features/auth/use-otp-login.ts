import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { errorMessage } from "@/lib/error-messages";
import { useServerForm } from "@/lib/use-server-form";
import { requestLoginCode } from "./api";
import { otpPhoneSchema, type OtpPhoneValues } from "./schemas";
import { useResendCountdown } from "./use-resend-countdown";

/**
 * Phone sign-in step 1 (parents): ask for a code. The API answers the same
 * for every number, so the code step always follows.
 */
export function useOtpLogin() {
  const [phone, setPhone] = useState<string | null>(null);
  const countdown = useResendCountdown();
  const phoneForm = useServerForm<OtpPhoneValues, Awaited<ReturnType<typeof requestLoginCode>>>({
    schema: otpPhoneSchema,
    defaultValues: { phone: "" },
    onSubmit: ({ phone: value }) => requestLoginCode(value),
    onSuccess: (result, values) => {
      setPhone(values.phone.trim());
      countdown.start(result.data.resendAfterSeconds);
    },
  });
  const resend = useMutation({
    mutationFn: (value: string) => requestLoginCode(value),
    onSuccess: (result) => countdown.start(result.data.resendAfterSeconds),
  });

  return {
    phoneForm,
    phone,
    secondsLeft: countdown.secondsLeft,
    resend: () => phone && resend.mutate(phone),
    resending: resend.isPending,
    resent: resend.isSuccess,
    resendError: resend.error ? errorMessage(resend.error) : null,
    changePhone: () => {
      setPhone(null);
      resend.reset();
    },
  };
}
