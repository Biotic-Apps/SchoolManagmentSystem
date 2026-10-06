import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";

export interface TwoFactorSetup {
  otpauthUrl: string;
  secret: string;
}

/** The API names the list `recoveryCodes`; `codes` is accepted for safety. */
function readRecoveryCodes(data: { recoveryCodes?: string[]; codes?: string[] } | null): string[] {
  return data?.recoveryCodes ?? data?.codes ?? [];
}

export function useStartTwoFactorSetup() {
  return useApiMutation({
    mutationFn: async () => (await http.post<TwoFactorSetup>("/auth/2fa/setup")).data,
  });
}

export function enableTwoFactor(code: string): Promise<string[]> {
  return http
    .post<{ recoveryCodes?: string[]; codes?: string[] } | null>("/auth/2fa/enable", { code })
    .then((result) => readRecoveryCodes(result.data));
}

export function disableTwoFactor(password: string, code: string) {
  return http.post<{ ok: boolean }>("/auth/2fa/disable", { password, code });
}
