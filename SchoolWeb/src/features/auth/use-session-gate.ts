import { useCallback } from "react";
import { useSession } from "./session-context";
import { useIdleLogout } from "./use-idle-logout";
import { useRequireSession } from "./use-require-session";

/** Portal guard: redirect when anonymous, auto sign-out when idle. */
export function useSessionGate() {
  const { signOut, session } = useSession();
  const status = useRequireSession();
  const onIdle = useCallback(() => void signOut("idle"), [signOut]);
  useIdleLogout(status === "authenticated", onIdle, session?.sessionTimeoutMinutes);
  return status;
}
