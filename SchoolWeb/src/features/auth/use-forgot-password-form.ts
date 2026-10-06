import { useState } from "react";
import { useServerForm } from "@/lib/use-server-form";
import { requestPasswordReset } from "./api";
import { forgotPasswordSchema, type ForgotPasswordValues } from "./schemas";

/** The API always answers ok (no account enumeration), so the page shows one generic message. */
export function useForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const result = useServerForm<ForgotPasswordValues>({
    schema: forgotPasswordSchema,
    defaultValues: { identifier: "" },
    onSubmit: ({ identifier }) => requestPasswordReset(identifier),
    onSuccess: () => setSent(true),
  });
  return { ...result, sent, again: () => setSent(false) };
}
