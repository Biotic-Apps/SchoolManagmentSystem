import { useMutation } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { loginRequest, verifyOtpRequest, verifyTwoFactorRequest } from "./auth-client";
import type { ChangePasswordValues, LoginInput } from "./schemas";
import { useSession } from "./session-context";
import { isTwoFactorChallenge, type TwoFactorChallenge } from "./types";

export function useLoginMutation() {
  const { signIn } = useSession();
  return useMutation({
    mutationFn: async (input: LoginInput): Promise<TwoFactorChallenge | null> => {
      const result = await loginRequest(input);
      if (isTwoFactorChallenge(result)) return result;
      await signIn(result);
      return null;
    },
  });
}

/** Email-code sign-in step 2: like useLoginMutation, resolves to a 2FA challenge or null once signed in. */
export function useOtpLoginMutation() {
  const { signIn } = useSession();
  return useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }): Promise<TwoFactorChallenge | null> => {
      const result = await verifyOtpRequest(email, code);
      if (isTwoFactorChallenge(result)) return result;
      await signIn(result);
      return null;
    },
  });
}

/** Always `ok` (no enumeration); a code is only sent to parent accounts. */
export function requestLoginCode(email: string) {
  return http.post<{ ok: boolean; resendAfterSeconds: number; devCode?: string }>("/auth/otp/request", { email });
}

export function useVerifyTwoFactorMutation() {
  const { signIn } = useSession();
  return useMutation({
    mutationFn: async ({ challengeId, code }: { challengeId: string; code: string }) =>
      signIn(await verifyTwoFactorRequest(challengeId, code)),
  });
}

export function requestPasswordReset(identifier: string) {
  return http.post<{ ok: boolean }>("/auth/password/forgot", { identifier });
}

export function resetPassword(token: string, newPassword: string) {
  return http.post<{ ok: boolean }>("/auth/password/reset", { token, newPassword });
}

export function changePassword({ currentPassword, newPassword }: ChangePasswordValues) {
  return http.post<{ ok: boolean }>("/auth/password/change", { currentPassword, newPassword });
}
