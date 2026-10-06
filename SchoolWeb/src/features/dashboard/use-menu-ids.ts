import { useMemo } from "react";
import type { NavId } from "@/config/navigation";
import { useSession } from "@/features/auth/session-context";
import { menuFor } from "@/lib/permissions";

/** Menu entries the active role can open; dashboard links only point at these. */
export function useMenuIds(): Set<NavId> {
  const { session } = useSession();
  return useMemo(() => new Set(menuFor(session).map((entry) => entry.id)), [session]);
}
