import { useCan } from "@/features/auth/use-can";
import { useIsParent } from "@/features/auth/use-active-child";
import { useSession } from "@/features/auth/session-context";

export type TimetableView = "child" | "mine" | "teacher" | "admin";

const OWN_WEEK_ROLES = new Set(["TEACHER", "HELPER"]);

/** Parents see their child's week; teachers/helpers without edit rights see their own; others manage. */
export function useTimetableView(): TimetableView {
  const isParent = useIsParent();
  const role = useSession().session?.activeRole;
  const can = useCan();
  if (isParent) return "child";
  // Teachers edit at most their class-teacher section (decided per section by the API), never the whole branch.
  if (role === "TEACHER") return "teacher";
  if (role && OWN_WEEK_ROLES.has(role) && !can("timetable.edit")) return "mine";
  return "admin";
}
