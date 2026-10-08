import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import type { TeachingStaff } from "./setup-types";

export const teachingStaffKey = (branchId: string, sessionId: string | null) =>
  ["teaching-staff", branchId, sessionId ?? ""] as const;

/** Every active teacher of the branch (with or without a login), with their period load. */
export function useTeachingStaff(branchId: string | null, sessionId: string | null) {
  return useQuery({
    queryKey: teachingStaffKey(branchId ?? "", sessionId),
    queryFn: async () =>
      (await http.get<TeachingStaff[]>(`/branches/${branchId}/teaching-staff`, { sessionId })).data ?? [],
    enabled: !!branchId,
    staleTime: 30_000,
  });
}

/** "24/30 periods": placed in timetables / allocated per week. */
export function loadLabel(staff: TeachingStaff): string {
  return `${staff.placedPeriods}/${staff.allocatedPeriods} periods`;
}
