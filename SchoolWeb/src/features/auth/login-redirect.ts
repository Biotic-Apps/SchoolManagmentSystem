import type { SignOutReason } from "./types";

export const DEFAULT_LANDING = "/dashboard";

// Browsers read "/\host" like "//host", so backslashes and control characters are refused too.
const UNSAFE_PATH = /[\\\u0000-\u001f\u007f]/;

/** Only same-site relative paths are accepted as a post-login target. */
export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || UNSAFE_PATH.test(value)) return DEFAULT_LANDING;
  if (value.startsWith("/login")) return DEFAULT_LANDING;
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
