import { useMemo } from "react";
import { useSession } from "@/features/auth/session-context";
import { useBranchPicker } from "@/features/branches/use-branch-picker";
import { useMenuIds } from "@/features/dashboard/use-menu-ids";
import { useSetupChecklist } from "./api";
import { checklistView } from "./checklist-items";
import { useDismissedChecklist } from "./use-dismissed-checklist";

const ROLES = new Set(["PRINCIPAL", "SUPER_ADMIN"]);

/**
 * "Set up your school" for principals (their branch) and super admins (the dashboard's branch,
 * else the card's own branch picker). Hidden when complete, dismissed, or the API can't answer.
 */
export function useSetupChecklistCard(scopeBranchId: string | null) {
  const { session } = useSession();
  const menu = useMenuIds();
  const role = session?.activeRole ?? "";
  const isSuperAdmin = role === "SUPER_ADMIN";
  const allowed = ROLES.has(role);

  const picker = useBranchPicker();
  const ownPicker = isSuperAdmin && !scopeBranchId;
  const branchId = scopeBranchId ?? (isSuperAdmin ? picker.branchId : null);

  const query = useSetupChecklist(branchId, allowed && (!isSuperAdmin || !!branchId));
  const dismissed = useDismissedChecklist(session?.user.id ?? null, branchId ?? "own");
  const items = useMemo(() => checklistView(query.data?.items ?? [], menu), [query.data, menu]);
  const done = items.filter((item) => item.done).length;

  return {
    visible: allowed && !!query.data && !query.data.complete && !dismissed.isDismissed,
    items,
    done,
    total: items.length,
    dismiss: dismissed.dismiss,
    picker: ownPicker ? picker : null,
    branchName: isSuperAdmin ? picker.options.find((option) => option.id === branchId)?.name ?? null : null,
  };
}
