import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { timetableKeys } from "./api";
import type { BellSchedule, BellScheduleInput } from "./builder-types";

export function useBellScheduleQuery(branchId: string | null) {
  return useQuery({
    queryKey: timetableKeys.bell(branchId ?? ""),
    queryFn: async () => (await http.get<BellSchedule>(`/branches/${branchId}/bell-schedule`)).data,
    enabled: !!branchId,
  });
}

/** 409 PERIODS_IN_USE lists the lessons on removed periods; the caller confirms and resends with dropLessons. */
export function useSaveBellSchedule(branchId: string) {
  return useApiMutation({
    mutationFn: (input: BellScheduleInput) => http.put<BellSchedule>(`/branches/${branchId}/bell-schedule`, input),
    invalidate: [timetableKeys.all, ["classes"]],
    success: "Bell schedule saved",
    toastError: false,
  });
}
