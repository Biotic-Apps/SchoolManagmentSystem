import type { SignOutReason } from "./types";

export const DEFAULT_LANDING = "/dashboard";

/** Only same-site relative paths are accepted as a post-login target. */
export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/login")) return DEFAULT_LANDING;
  return value;
}

export function loginUrl(currentPath: string, reason: SignOutReason | null): string {
  if (reason === "signed-out") return "/login";
  const params = new URLSearchParams();
  if (currentPath && currentPath !== "/" && currentPath !== DEFAULT_LANDING) params.set("next", currentPath);
  if (reason) params.set("reason", reason);
  const qs = params.toString();
  return qs ? `/login?${qs}` : "/login";
}
