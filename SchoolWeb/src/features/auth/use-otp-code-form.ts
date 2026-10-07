import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hasErrorCode } from "@/lib/api-error";
import { errorMessage } from "@/lib/error-messages";
import { useOtpLoginMutation } from "./api";
import { otpCodeSchema, type OtpCodeValues } from "./schemas";

const WRONG_CODE = "The code is wrong or has expired. Check the SMS or request a new code.";

/** Phone sign-in step 2: the SMS code → tokens, or a 2FA challenge handed to `onChallenge`. */
export function useOtpCodeForm(phone: string, onChallenge: (challengeId: string) => void) {
  const mutation = useOtpLoginMutation();
  const form = useForm<OtpCodeValues>({ resolver: zodResolver(otpCodeSchema), defaultValues: { code: "" } });

  const submit = form.handleSubmit(({ code }) =>
    mutation.mutate(
      { phone, code: code.replace(/\s/g, "") },
      { onSuccess: (challenge) => challenge && onChallenge(challenge.challengeId) },
    ),
  );

  const error = mutation.error;
  return {
    register: form.register,
    errors: form.formState.errors,
    submit,
    submitting: mutation.isPending,
    serverError: !error ? null : hasErrorCode(error, "INVALID_CREDENTIALS") ? WRONG_CODE : errorMessage(error),
  };
}
