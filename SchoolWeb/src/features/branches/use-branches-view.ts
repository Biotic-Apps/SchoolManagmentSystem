import { ROLE_MENUS, labelFor } from "@/config/navigation";
import { isRoleKey } from "@/config/roles";
import { useSession } from "@/features/auth/session-context";
import { useCan } from "@/features/auth/use-can";

/**
 * Roles whose menu has no "Sessions & Calendar" entry (e.g. PRINCIPAL → "Branch & Calendar")
 * get sessions and the calendar as a tab on this page (docs/navigation.md).
 */
export function useBranchesView() {
  const can = useCan();
  const role = useSession().session?.activeRole ?? "";
  const menuHasSessions = isRoleKey(role) ? ROLE_MENUS[role].includes("sessions") : true;
  const showCalendarTab = !menuHasSessions && can("sessions.view");

  return {
    title: labelFor(role, "branches"),
    description: showCalendarTab
      ? "Your branch details, academic sessions and calendar."
      : "Branches of each school, their timings, working days and principal.",
    showCalendarTab,
  };
}
