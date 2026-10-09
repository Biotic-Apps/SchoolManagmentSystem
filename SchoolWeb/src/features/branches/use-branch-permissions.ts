import { useSession } from "@/features/auth/session-context";
import { useCan } from "@/features/auth/use-can";

/** What the active role may do with branches (contract §5). */
export function useBranchPermissions() {
  const can = useCan();
  const role = useSession().session?.activeRole;
  // The API limits a principal to their own branch's timings, working days and contacts.
  const ownBranchOnly = role === "PRINCIPAL";
  return {
    canAdd: can("branches.add"),
    canEdit: can("branches.edit") && !ownBranchOnly,
    canEditTimings: can("branches.edit") && ownBranchOnly,
    canArchive: can("branches.delete"),
    canChangePrincipal: can("users.edit") && role === "SUPER_ADMIN",
    canEditSettings: can("settings.edit") || role === "PRINCIPAL",
    canFilterSchools: can("schools.view"),
  };
}
