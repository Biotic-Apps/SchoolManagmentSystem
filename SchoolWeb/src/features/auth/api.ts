import { useMutation } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { loginRequest } from "./auth-client";
import type { ChangePasswordValues, LoginInput } from "./schemas";
import { useSession } from "./session-context";

export function useLoginMutation() {
  const { signIn } = useSession();
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const tokens = await loginRequest(input);
      await signIn(tokens);
    },
  });
}

export function changePassword({ currentPassword, newPassword }: ChangePasswordValues) {
  return http.post<{ ok: boolean }>("/auth/password/change", { currentPassword, newPassword });
}
