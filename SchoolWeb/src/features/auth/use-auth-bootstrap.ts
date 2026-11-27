import { useEffect } from "react";
import { setActiveRoleHeader, setAuthHandlers } from "@/lib/request-context";
import { loadActiveRole } from "./active-role-store";
import { hasSessionHint } from "./auth-client";
import { isTransientAuthError, retryDelayMs, sleep } from "./refresh-policy";
import { renewAccessToken } from "./token-session";
import type { SignOutReason, WebTokens } from "./types";

interface BootstrapOptions {
  startSession: (tokens: WebTokens) => Promise<void>;
  endLocal: (reason: SignOutReason | null) => void;
  requirePasswordChange: () => void;
}

/** Runs task until it settles with a non-transient outcome; undefined when cancelled meanwhile. */
async function untilSettled<T>(task: () => Promise<T>, isCancelled: () => boolean): Promise<T | undefined> {
  for (let attempt = 0; !isCancelled(); attempt++) {
    try {
      return await task();
    } catch (error) {
      if (!isTransientAuthError(error)) throw error;
      await sleep(retryDelayMs(attempt + 2));
    }
  }
  return undefined;
}

/**
 * Silent refresh on app load, and the http client's 401 / password-change hooks.
 * Only a rejected refresh token signs out; a rate limit, network failure or 5xx keeps the
 * session in "loading" and retries with backoff.
 */
export function useAuthBootstrap({ startSession, endLocal, requirePasswordChange }: BootstrapOptions) {
  useEffect(() => {
    setAuthHandlers({
      // Throws on transient failures, so the request fails without ending the session.
      refresh: async () => (await renewAccessToken())?.accessToken ?? null,
      onExpired: () => endLocal("expired"),
      onPasswordChangeRequired: requirePasswordChange,
    });

    let cancelled = false;
    const isCancelled = () => cancelled;
    const run = async () => {
      setActiveRoleHeader(loadActiveRole());
      if (!hasSessionHint()) return endLocal(null);
      const tokens = await untilSettled(renewAccessToken, isCancelled).catch(() => null);
      if (cancelled) return;
      if (!tokens) return endLocal(null);
      await untilSettled(() => startSession(tokens), isCancelled).catch(() => {
        if (!cancelled) endLocal("expired");
      });
    };
    void run();

    return () => {
      cancelled = true;
      setAuthHandlers(null);
    };
  }, [startSession, endLocal, requirePasswordChange]);
}
