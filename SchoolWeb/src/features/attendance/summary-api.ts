import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { attendanceKeys } from "./api";
import type { SectionAttendanceRow, UnmarkedSection } from "./types";

export function useAttendanceSummary(branchId: string | null, date: string, enabled = true) {
  return useQuery({
    queryKey: attendanceKeys.summary(branchId, date),
    queryFn: async () => (await http.get<SectionAttendanceRow[]>("/attendance/summary", { branchId, date })).data,
    enabled: enabled && !!branchId,
    placeholderData: keepPreviousData,
  });
}

export function useUnmarkedSections(branchId: string | null, date: string, enabled = true) {
  return useQuery({
    queryKey: attendanceKeys.unmarked(branchId, date),
    queryFn: async () => (await http.get<UnmarkedSection[]>("/attendance/unmarked", { branchId, date })).data,
    enabled: enabled && !!branchId,
    placeholderData: keepPreviousData,
  });
}
