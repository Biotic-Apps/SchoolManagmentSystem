import { setAccessToken } from "@/lib/request-context";
import { refreshTokens } from "./auth-client";
import { isTransientAuthError } from "./refresh-policy";
import type { WebTokens } from "./types";

const REFRESH_LEAD_SECONDS = 60;
const MIN_DELAY_MS = 10_000;
const RETRY_AFTER_FAILURE_MS = 20_000;

let timer: ReturnType<typeof setTimeout> | null = null;

function cancelTimer() {
  if (timer) clearTimeout(timer);
  timer = null;
}

function schedule(delayMs: number) {
  cancelTimer();
  timer = setTimeout(() => {
    // A transient failure (429 / network / 5xx) keeps the session: try again a little later.
    renewAccessToken().catch((error) => {
      if (isTransientAuthError(error)) schedule(RETRY_AFTER_FAILURE_MS);
    });
  }, delayMs);
}

/** Keeps the access token in memory and renews it shortly before it expires. */
export function applyTokens(tokens: WebTokens) {
  setAccessToken(tokens.accessToken);
  schedule(Math.max(MIN_DELAY_MS, (tokens.accessExpiresIn - REFRESH_LEAD_SECONDS) * 1000));
}

/** Null means the refresh token was rejected (signed out); transient failures throw. */
export async function renewAccessToken(): Promise<WebTokens | null> {
  const tokens = await refreshTokens();
  if (tokens) applyTokens(tokens);
  return tokens;
}

export function clearTokens() {
  cancelTimer();
  setAccessToken(null);
}
