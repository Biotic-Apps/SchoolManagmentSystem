import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { attendanceKeys } from "./api";
import type { MyStaffAttendance, StaffAttendanceDay, StaffAttendanceInput } from "./types";

export function useStaffAttendance(branchId: string | null, date: string, enabled = true) {
  return useQuery({
    queryKey: attendanceKeys.staff(branchId, date),
    queryFn: async () => (await http.get<StaffAttendanceDay>("/staff-attendance", { branchId, date })).data,
    enabled: enabled && !!branchId,
  });
}

export function useSaveStaffAttendance() {
  return useApiMutation({
    mutationFn: async (input: StaffAttendanceInput) =>
      (await http.put<StaffAttendanceDay>("/staff-attendance", input)).data,
    invalidate: [["attendance", "staff"], ["attendance", "staff-me"], ["dashboard"]],
    success: "Staff attendance saved",
  });
}

export function useMyStaffAttendance(from: string, to: string) {
  return useQuery({
    queryKey: attendanceKeys.myStaff(from, to),
    queryFn: async () => (await http.get<MyStaffAttendance>("/staff-attendance/me", { from, to })).data,
    placeholderData: keepPreviousData,
  });
}
