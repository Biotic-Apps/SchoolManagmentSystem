import { useState } from "react";
import { useStartChildLink, useVerifyChildLinkOtp } from "@/features/guardians/child-links-api";
import type { ChildLinkStarted } from "@/features/guardians/types";
import { useServerForm } from "@/lib/use-server-form";
import { EMPTY_LINK_CHILD, linkChildSchema, otpSchema, toChildLinkStart, type LinkChildValues, type OtpValues } from "./parent-schemas";

type Step = "details" | "otp" | "sent";

/** PARENT: admission no + DOB + relation → OTP to the child's registered phone → request for school approval. */
export function useLinkChild() {
  const [step, setStep] = useState<Step>("details");
  const [started, setStarted] = useState<ChildLinkStarted | null>(null);
  const start = useStartChildLink();
  const verify = useVerifyChildLinkOtp();

  const details = useServerForm<LinkChildValues, ChildLinkStarted>({
    schema: linkChildSchema,
    defaultValues: EMPTY_LINK_CHILD,
    onSubmit: (values) => start.mutateAsync(toChildLinkStart(values)),
    onSuccess: (result) => {
      setStarted(result);
      setStep("otp");
    },
  });

  const otp = useServerForm<OtpValues>({
    schema: otpSchema,
    defaultValues: { code: "" },
    onSubmit: (values) => verify.mutateAsync({ requestId: started?.requestId ?? "", code: values.code }),
    onSuccess: () => setStep("sent"),
  });

  const restart = () => {
    details.form.reset(EMPTY_LINK_CHILD);
    otp.form.reset({ code: "" });
    setStarted(null);
    setStep("details");
  };

  return { step, started, details, otp, restart };
}
