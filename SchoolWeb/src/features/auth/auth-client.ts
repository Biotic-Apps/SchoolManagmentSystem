import { ApiError, networkError } from "@/lib/api-error";
import { CSRF_COOKIE, CSRF_HEADER } from "@/lib/auth-cookie-names";
import { readCookie } from "@/lib/cookies";
import { parseEnvelope, readJson, toApiError } from "@/lib/envelope";
import { isTransientStatus, parseRetryAfter, retryDelayMs, sleep } from "./refresh-policy";
import type { LoginInput } from "./schemas";
import type { LoginResult, WebTokens } from "./types";

// Calls the Next.js BFF (src/app/api/auth/*), which owns the refresh-token cookie.
async function bffFetch(path: string, body?: unknown, accessToken?: string | null): Promise<Response> {
  const headers = new Headers({ Accept: "application/json", "Content-Type": "application/json" });
  const csrf = readCookie(CSRF_COOKIE);
  if (csrf) headers.set(CSRF_HEADER, csrf);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  try {
    return await fetch(`/api/auth/${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body ?? {}),
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw networkError();
  }
}

async function bffPost<T>(path: string, body?: unknown, accessToken?: string | null): Promise<T> {
  return (await parseEnvelope<T>(await bffFetch(path, body, accessToken))).data;
}

export function loginRequest(input: LoginInput): Promise<LoginResult> {
  return bffPost<LoginResult>("login", input);
}

/** Parent email + emailed code; answers like loginRequest (tokens or a 2FA challenge). */
export function verifyOtpRequest(email: string, code: string): Promise<LoginResult> {
  return bffPost<LoginResult>("otp/verify", { email, code });
}

export function verifyTwoFactorRequest(challengeId: string, code: string): Promise<WebTokens> {
  return bffPost<WebTokens>("2fa/verify", { challengeId, code });
}

export async function logoutRequest(accessToken: string | null): Promise<void> {
  await bffPost("logout", undefined, accessToken).catch(() => undefined);
}

/** The CSRF cookie is readable and lives exactly as long as the refresh cookie. */
export function hasSessionHint(): boolean {
  return !!readCookie(CSRF_COOKIE);
}

// Tabs share one refresh cookie; a Web Lock stops two tabs rotating it at once (reuse would revoke the session).
// Each attempt takes the lock on its own, so a tab waiting out a backoff does not block the others.
function withRefreshLock<T>(task: () => Promise<T>): Promise<T> {
  const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
  return locks ? (locks.request("eschool-token-refresh", task) as Promise<T>) : task();
}

type RefreshOutcome =
  | { kind: "ok"; tokens: WebTokens }
  | { kind: "signed-out" }
  | { kind: "retry"; error: ApiError; retryAfterMs: number | null };

async function refreshOnce(): Promise<RefreshOutcome> {
  let response: Response;
  try {
    response = await bffFetch("refresh");
  } catch (error) {
    return { kind: "retry", error: error as ApiError, retryAfterMs: null };
  }
  if (response.ok) return { kind: "ok", tokens: (await parseEnvelope<WebTokens>(response)).data };
  if (!isTransientStatus(response.status)) return { kind: "signed-out" };
  return {
    kind: "retry",
    error: toApiError(response.status, await readJson(response)),
    retryAfterMs: parseRetryAfter(response.headers.get("Retry-After")),
  };
}

const REFRESH_ATTEMPTS = 3;

async function refreshWithRetry(): Promise<WebTokens | null> {
  for (let attempt = 0; ; attempt++) {
    const outcome = await withRefreshLock(refreshOnce);
    if (outcome.kind === "ok") return outcome.tokens;
    if (outcome.kind === "signed-out") return null;
    if (attempt + 1 >= REFRESH_ATTEMPTS) throw outcome.error;
    await sleep(retryDelayMs(attempt, outcome.retryAfterMs));
  }
}

let inflight: Promise<WebTokens | null> | null = null;

/**
 * Single-flight: concurrent callers share one refresh request.
 * Resolves null only when the API rejected the refresh token (401/403: invalid, expired, revoked);
 * a rate limit (429), network failure or 5xx is retried with backoff and then thrown as an ApiError,
 * so callers keep the session instead of signing the user out.
 */
export function refreshTokens(): Promise<WebTokens | null> {
  inflight ??= refreshWithRetry().finally(() => {
    inflight = null;
  });
  return inflight;
}
