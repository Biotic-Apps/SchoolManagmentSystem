import { useSession } from "@/features/auth/session-context";
import { useActiveBranches } from "@/features/branches/api";

/**
 * School whose branding the portal shows: the active role's assigned school; for global roles
 * (super admin) the school they work in when every branch in their scope belongs to one school.
 * Null otherwise, and /branding then answers with the default eSchool branding.
 */
export function useSessionSchoolId(): string | null {
  const { session } = useSession();
  const assignment = session?.assignments.find((item) => item.role === session.activeRole && item.schoolId);
  const isGlobal = !!session?.assignments.some(
    (item) => item.role === session.activeRole && item.scopeType === "GLOBAL",
  );
  const { branches } = useActiveBranches(undefined, !assignment && isGlobal);
  if (!session) return null;
  if (assignment?.schoolId) return assignment.schoolId;
  if (!isGlobal) return null;
  const schoolIds = new Set(branches.map((branch) => branch.schoolId));
  return schoolIds.size === 1 ? [...schoolIds][0] : null;
}
