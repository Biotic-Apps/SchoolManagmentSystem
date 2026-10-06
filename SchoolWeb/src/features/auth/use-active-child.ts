import { useSession } from "./session-context";
import type { ChildSummary } from "./types";

/** The child picked in the Topbar ChildSwitcher (PARENT role); null for other roles or no children. */
export function useActiveChild(): ChildSummary | null {
  const { session, activeChildId } = useSession();
  if (session?.activeRole !== "PARENT") return null;
  return session.children.find((child) => child.id === activeChildId) ?? session.children[0] ?? null;
}

export function useIsParent(): boolean {
  return useSession().session?.activeRole === "PARENT";
}
