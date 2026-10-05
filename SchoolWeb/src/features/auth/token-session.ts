import { setAccessToken } from "@/lib/request-context";
import { refreshTokens } from "./auth-client";
import type { WebTokens } from "./types";

const REFRESH_LEAD_SECONDS = 60;
const MIN_DELAY_MS = 10_000;

let timer: ReturnType<typeof setTimeout> | null = null;

function cancelTimer() {
  if (timer) clearTimeout(timer);
  timer = null;
}

/** Keeps the access token in memory and renews it shortly before it expires. */
export function applyTokens(tokens: WebTokens) {
  setAccessToken(tokens.accessToken);
  cancelTimer();
  const delay = Math.max(MIN_DELAY_MS, (tokens.accessExpiresIn - REFRESH_LEAD_SECONDS) * 1000);
  timer = setTimeout(() => void renewAccessToken(), delay);
}

export async function renewAccessToken(): Promise<WebTokens | null> {
  const tokens = await refreshTokens();
  if (tokens) applyTokens(tokens);
  return tokens;
}

export function clearTokens() {
  cancelTimer();
  setAccessToken(null);
}
