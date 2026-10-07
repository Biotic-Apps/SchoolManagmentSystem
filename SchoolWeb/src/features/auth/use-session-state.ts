import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { hasErrorCode } from "@/lib/api-error";
import { errorMessage } from "@/lib/error-messages";
import { getAccessToken, setActiveRoleHeader } from "@/lib/request-context";
import { toast } from "@/lib/toast";
import { saveActiveRole } from "./active-role-store";
import { logoutRequest } from "./auth-client";
import { fetchMe } from "./me-api";
import { applyTokens, clearTokens } from "./token-session";
import type { AuthStatus, Session, SessionUser, SignOutReason, WebTokens } from "./types";
import { useAuthBootstrap } from "./use-auth-bootstrap";

interface SessionSnapshot {
  status: AuthStatus;
  session: Session | null;
  reason: SignOutReason | null;
}

function initialSnapshot(): SessionSnapshot {
  return { status: "loading", session: null, reason: null };
}

export function useSessionState() {
  const queryClient = useQueryClient();
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  const endLocal = useCallback(
    (reason: SignOutReason | null) => {
      clearTokens();
      setActiveRoleHeader(null);
      saveActiveRole(null);
      setSnapshot({ status: "anonymous", session: null, reason });
      setActiveChildId(null);
      queryClient.clear();
    },
    [queryClient],
  );

  const requirePasswordChange = useCallback(
    () => setSnapshot((current) => ({ ...current, status: "password-change" })),
    [],
  );

  const loadMe = useCallback(async () => {
    try {
      const me = await fetchMe();
      setActiveRoleHeader(me.activeRole);
      setSnapshot({ status: me.user.mustChangePassword ? "password-change" : "authenticated", session: me, reason: null });
      setActiveChildId((current) =>
        current && me.children.some((child) => child.id === current) ? current : (me.children[0]?.id ?? null),
      );
    } catch (error) {
      if (!hasErrorCode(error, "PASSWORD_CHANGE_REQUIRED")) throw error;
      requirePasswordChange();
    }
  }, [requirePasswordChange]);

  const signIn = useCallback(
    async (tokens: WebTokens) => {
      applyTokens(tokens);
      if (tokens.mustChangePassword) return requirePasswordChange();
      await loadMe();
    },
    [loadMe, requirePasswordChange],
  );

  useAuthBootstrap({ startSession: signIn, endLocal, requirePasswordChange });

  const signOut = useCallback(
    async (reason: SignOutReason = "signed-out") => {
      await logoutRequest(getAccessToken());
      endLocal(reason);
    },
    [endLocal],
  );

  const switchRole = useCallback(
    async (role: string) => {
      const current = snapshot.session;
      if (!current || role === current.activeRole || !current.roles.includes(role)) return;
      setActiveRoleHeader(role);
      saveActiveRole(role);
      queryClient.removeQueries();
      await loadMe().catch((error) => toast.error(errorMessage(error)));
    },
    [snapshot.session, queryClient, loadMe],
  );

  const completePasswordChange = useCallback(
    () => loadMe().catch(() => endLocal("expired")),
    [loadMe, endLocal],
  );

  const updateUser = useCallback(
    (user: Partial<SessionUser>) =>
      setSnapshot((s) => (s.session ? { ...s, session: { ...s.session, user: { ...s.session.user, ...user } } } : s)),
    [],
  );

  return {
    status: snapshot.status,
    session: snapshot.session,
    reason: snapshot.reason,
    activeChildId,
    selectChild: setActiveChildId,
    signIn,
    signOut,
    switchRole,
    completePasswordChange,
    updateUser,
  };
}

export type SessionState = ReturnType<typeof useSessionState>;
