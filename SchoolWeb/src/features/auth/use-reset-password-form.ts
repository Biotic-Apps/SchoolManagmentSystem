import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWatch } from "react-hook-form";
import { useServerForm } from "@/lib/use-server-form";
import { resetPassword } from "./api";
import { resetPasswordSchema, type ResetPasswordValues } from "./schemas";

export function useResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [linkToken] = useState(() => params.get("token") ?? "");

  // Keep the token out of the address bar, history and referrers once it has been read.
  useEffect(() => {
    if (linkToken) window.history.replaceState(null, "", "/reset-password");
  }, [linkToken]);

  const result = useServerForm<ResetPasswordValues>({
    schema: resetPasswordSchema,
    defaultValues: { token: linkToken, newPassword: "", confirmPassword: "" },
    onSubmit: ({ token, newPassword }) => resetPassword(token.trim(), newPassword),
    onSuccess: () => router.replace("/login?reason=reset"),
  });
  const newPassword = useWatch({ control: result.form.control, name: "newPassword" });

  return { ...result, hasLinkToken: !!linkToken, newPassword };
}
