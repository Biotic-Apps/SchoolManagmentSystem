import { useCallback } from "react";
import { useSession } from "./session-context";

/** Revokes the session on the API and clears local state; the session gate then routes to /login. */
export function useSignOut() {
  const { signOut } = useSession();
  return useCallback(() => void signOut("signed-out"), [signOut]);
}
