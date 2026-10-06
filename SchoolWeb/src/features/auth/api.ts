import { useMutation } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { loginRequest, verifyTwoFactorRequest } from "./auth-client";
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
