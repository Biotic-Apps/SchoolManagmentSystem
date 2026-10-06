import { useSession } from "@/features/auth/session-context";

export type DashboardView = "parent" | "teacher" | "leader" | "admin";

const LEADER_ROLES = new Set(["SUPER_ADMIN", "PRINCIPAL", "COORDINATOR", "HEAD_TEACHER"]);
const TEACHER_ROLES = new Set(["TEACHER", "HELPER"]);

/** Which "Today" panel the dashboard shows for the active role. */
export function useDashboardView(): DashboardView {
  const role = useSession().session?.activeRole ?? "";
  if (role === "PARENT") return "parent";
  if (TEACHER_ROLES.has(role)) return "teacher";
  if (LEADER_ROLES.has(role)) return "leader";
  return "admin";
}
