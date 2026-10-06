import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { errorMessage } from "@/lib/error-messages";
import { IDLE_TIMEOUT_MINUTES } from "@/config/env";
import { useLoginMutation } from "./api";
import { safeNextPath } from "./login-redirect";
import { loginSchema, type LoginInput } from "./schemas";
import { useRedirectIfSignedIn } from "./use-require-session";

const REASON_NOTICE: Record<string, string> = {
  idle: `You were signed out after ${IDLE_TIMEOUT_MINUTES} minutes without activity.`,
  expired: "Your session has ended. Please sign in again.",
  reset: "Your password was changed. Sign in with the new password.",
};

export function useLoginForm() {
  const params = useSearchParams();
  useRedirectIfSignedIn(safeNextPath(params.get("next")));
  const mutation = useLoginMutation();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const [challengeId, setChallengeId] = useState<string | null>(null);

  const submit = form.handleSubmit((values) =>
    mutation.mutate(values, { onSuccess: (challenge) => setChallengeId(challenge?.challengeId ?? null) }),
  );

  const backToPassword = () => {
    setChallengeId(null);
    mutation.reset();
    form.setValue("password", "");
  };

  return {
    register: form.register,
    errors: form.formState.errors,
    submit,
    submitting: mutation.isPending,
    serverError: mutation.error ? errorMessage(mutation.error) : null,
    notice: mutation.error ? null : (REASON_NOTICE[params.get("reason") ?? ""] ?? null),
    challengeId,
    backToPassword,
  };
}
