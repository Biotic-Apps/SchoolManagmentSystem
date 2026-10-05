import { networkError } from "@/lib/api-error";
import { CSRF_COOKIE, CSRF_HEADER } from "@/lib/auth-cookie-names";
import { readCookie } from "@/lib/cookies";
import { parseEnvelope } from "@/lib/envelope";
import type { LoginInput } from "./schemas";
import type { WebTokens } from "./types";

// Calls the Next.js BFF (src/app/api/auth/*), which owns the refresh-token cookie.
async function bffPost<T>(path: string, body?: unknown, accessToken?: string | null): Promise<T> {
  const headers = new Headers({ Accept: "application/json", "Content-Type": "application/json" });
  const csrf = readCookie(CSRF_COOKIE);
  if (csrf) headers.set(CSRF_HEADER, csrf);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  let response: Response;
  try {
    response = await fetch(`/api/auth/${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body ?? {}),
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw networkError();
  }
  return (await parseEnvelope<T>(response)).data;
}

export function loginRequest(input: LoginInput): Promise<WebTokens> {
  return bffPost<WebTokens>("login", input);
}

export async function logoutRequest(accessToken: string | null): Promise<void> {
  await bffPost("logout", undefined, accessToken).catch(() => undefined);
}

/** The CSRF cookie is readable and lives exactly as long as the refresh cookie. */
export function hasSessionHint(): boolean {
  return !!readCookie(CSRF_COOKIE);
}

// Tabs share one refresh cookie; a Web Lock stops two tabs rotating it at once (reuse would revoke the session).
function withRefreshLock<T>(task: () => Promise<T>): Promise<T> {
  const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
  return locks ? (locks.request("eschool-token-refresh", task) as Promise<T>) : task();
}

let inflight: Promise<WebTokens | null> | null = null;

/** Single-flight: concurrent callers share one refresh request. */
export function refreshTokens(): Promise<WebTokens | null> {
  inflight ??= withRefreshLock(() => bffPost<WebTokens>("refresh").catch(() => null)).finally(() => {
    inflight = null;
  });
  return inflight;
}
