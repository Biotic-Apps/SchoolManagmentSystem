import { MODULE_PHASE } from "@/config/module-phases";
import { labelFor, navItem, type NavId } from "@/config/navigation";
import { useSession } from "@/features/auth/session-context";
import { can, menuFor } from "@/lib/permissions";

interface AccessOptions {
  /**
   * Module screens open only from the active role's menu (a teacher's students.view is for in-screen
   * use, not the whole Students module). Detail pages reached from another screen pass false.
   */
  menuOnly?: boolean;
}

export function useModuleAccess(id: NavId, { menuOnly = true }: AccessOptions = {}) {
  const { session } = useSession();
  const entry = navItem(id);
  const permitted = can(session, entry.permission);
  const inMenu = menuFor(session).some((item) => item.id === id);
  return {
    label: labelFor(session?.activeRole, id),
    icon: entry.icon,
    phase: MODULE_PHASE[id],
    allowed: permitted && (!menuOnly || inMenu),
  };
}
