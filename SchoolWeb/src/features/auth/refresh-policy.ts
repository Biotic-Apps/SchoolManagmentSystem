import { ApiError } from "@/lib/api-error";

const BASE_DELAY_MS = 1_000;
const MAX_DELAY_MS = 30_000;
const MAX_RETRY_AFTER_MS = 60_000;

/** Only these refresh answers mean "try again later"; anything else (401/403/400) means the session is gone. */
export function isTransientStatus(status: number): boolean {
  return status === 0 || status === 408 || status === 429 || status >= 500;
}

export function isTransientAuthError(error: unknown): boolean {
  return error instanceof ApiError && isTransientStatus(error.status);
}

/** Retry-After (seconds or HTTP date) as milliseconds, or null. */
export function parseRetryAfter(value: string | null, now = Date.now()): number | null {
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, MAX_RETRY_AFTER_MS);
  const at = Date.parse(value);
  return Number.isNaN(at) ? null : Math.min(Math.max(0, at - now), MAX_RETRY_AFTER_MS);
}

/** Exponential backoff with jitter (1 s, 2 s, 4 s … capped at 30 s); a server Retry-After wins when longer. */
export function retryDelayMs(attempt: number, retryAfterMs: number | null = null, random = Math.random): number {
  const backoff = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** Math.max(0, attempt));
  const jittered = backoff / 2 + random() * (backoff / 2);
  return Math.max(jittered, retryAfterMs ?? 0);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
