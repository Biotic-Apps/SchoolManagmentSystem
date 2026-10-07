import { useEffect } from "react";
import { setActiveRoleHeader, setAuthHandlers } from "@/lib/request-context";
import { loadActiveRole } from "./active-role-store";
import { hasSessionHint } from "./auth-client";
import { renewAccessToken } from "./token-session";
import type { SignOutReason, WebTokens } from "./types";

interface BootstrapOptions {
  startSession: (tokens: WebTokens) => Promise<void>;
  endLocal: (reason: SignOutReason | null) => void;
  requirePasswordChange: () => void;
}

/** Silent refresh on app load, and the http client's 401 / password-change hooks. */
export function useAuthBootstrap({ startSession, endLocal, requirePasswordChange }: BootstrapOptions) {
  useEffect(() => {
    setAuthHandlers({
      refresh: async () => (await renewAccessToken())?.accessToken ?? null,
      onExpired: () => endLocal("expired"),
      onPasswordChangeRequired: requirePasswordChange,
    });

    let cancelled = false;
    const run = async () => {
      setActiveRoleHeader(loadActiveRole());
      const tokens = hasSessionHint() ? await renewAccessToken() : null;
      if (cancelled) return;
      if (!tokens) return endLocal(null);
      await startSession(tokens).catch(() => endLocal("expired"));
    };
    void run();

    return () => {
      cancelled = true;
      setAuthHandlers(null);
    };
  }, [startSession, endLocal, requirePasswordChange]);
}
