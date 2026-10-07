import { useMemo } from "react";
import { useSession } from "@/features/auth/session-context";
import type { Branch } from "./types";

/**
 * Branches of the active role's assignments (from /me), for roles that may not list branches.
 * Only id, name and school are known; the other fields are neutral placeholders.
 */
export function useAssignedBranches(schoolId?: string): Branch[] {
  const { session } = useSession();
  return useMemo(() => {
    const byId = new Map<string, Branch>();
    for (const a of session?.assignments ?? []) {
      if (a.role !== session?.activeRole || !a.branchId || !a.schoolId) continue;
      if (schoolId && a.schoolId !== schoolId) continue;
      if (byId.has(a.branchId)) continue;
      byId.set(a.branchId, {
        id: a.branchId,
        name: a.branchName ?? "Branch",
        schoolId: a.schoolId,
        schoolName: a.schoolName ?? "",
        code: "",
        address: null,
        phone: null,
        email: null,
        timings: null,
        workingDays: [],
        principal: null,
        status: "ACTIVE",
        createdAt: "",
      });
    }
    return [...byId.values()];
  }, [session, schoolId]);
}
