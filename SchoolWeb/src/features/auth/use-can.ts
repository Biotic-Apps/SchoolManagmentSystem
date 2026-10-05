import { useCallback } from "react";
import { can } from "@/lib/permissions";
import { useSession } from "./session-context";

/** Permission check bound to the active role context. */
export function useCan() {
  const { session } = useSession();
  return useCallback((permission: string) => can(session, permission), [session]);
}

export function useCurrentUserId(): string | null {
  return useSession().session?.user.id ?? null;
}
