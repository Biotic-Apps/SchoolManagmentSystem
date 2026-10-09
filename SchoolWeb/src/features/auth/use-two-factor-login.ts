import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { errorMessage } from "@/lib/error-messages";
import { useVerifyTwoFactorMutation } from "./api";
import { twoFactorCodeSchema, type TwoFactorCodeValues } from "./schemas";

/** Second sign-in step: authenticator code, or one of the recovery codes. */
export function useTwoFactorLogin(challengeId: string) {
  const mutation = useVerifyTwoFactorMutation();
  const form = useForm<TwoFactorCodeValues>({
    resolver: zodResolver(twoFactorCodeSchema),
    defaultValues: { mode: "totp", code: "" },
  });
  const mode = useWatch({ control: form.control, name: "mode" });

  const submit = form.handleSubmit(({ mode: kind, code }) =>
    mutation.isPending ? undefined : mutation.mutate({ challengeId, code: kind === "totp" ? code.replace(/\s/g, "") : code.trim() }),
  );

  const toggleMode = () => {
    form.reset({ mode: mode === "totp" ? "recovery" : "totp", code: "" });
    mutation.reset();
  };

  return {
    register: form.register,
    errors: form.formState.errors,
    mode,
    toggleMode,
    submit,
    submitting: mutation.isPending,
    serverError: mutation.error ? errorMessage(mutation.error) : null,
  };
}
