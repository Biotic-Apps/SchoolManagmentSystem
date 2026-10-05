import { MODULE_PHASE } from "@/config/module-phases";
import { labelFor, navItem, type NavId } from "@/config/navigation";
import { useSession } from "@/features/auth/session-context";
import { can } from "@/lib/permissions";

export function useModuleAccess(id: NavId) {
  const { session } = useSession();
  const entry = navItem(id);
  return {
    label: labelFor(session?.activeRole, id),
    icon: entry.icon,
    phase: MODULE_PHASE[id],
    allowed: can(session, entry.permission),
  };
}
