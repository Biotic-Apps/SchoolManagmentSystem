import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { CorrectionInput, ProbationResult, Register, RegisterInput, StudentAttendance } from "./types";

export const attendanceKeys = {
  all: ["attendance"] as const,
  register: (sectionId: string | null, date: string) => ["attendance", "register", sectionId, date] as const,
  student: (studentId: string, from: string, to: string) => ["attendance", "student", studentId, from, to] as const,
  summary: (branchId: string | null, date: string) => ["attendance", "summary", branchId, date] as const,
  unmarked: (branchId: string | null, date: string) => ["attendance", "unmarked", branchId, date] as const,
  staff: (branchId: string | null, date: string) => ["attendance", "staff", branchId, date] as const,
  myStaff: (from: string, to: string) => ["attendance", "staff-me", from, to] as const,
};

export function useRegister(sectionId: string | null, date: string) {
  return useQuery({
    queryKey: attendanceKeys.register(sectionId, date),
    queryFn: async () => (await http.get<Register>("/attendance/registers", { sectionId, date })).data,
    enabled: !!sectionId,
    retry: false,
  });
}

/** Errors (409 / 423) are handled by the register screen, so no error toast here. */
export function useSaveRegister() {
  return useApiMutation({
    mutationFn: async (input: RegisterInput) => (await http.put<Register>("/attendance/registers", input)).data,
    invalidate: [["attendance", "summary"], ["attendance", "unmarked"], ["dashboard"]],
    success: "Draft saved",
    toastError: false,
  });
}

export function useSubmitRegister() {
  return useApiMutation({
    mutationFn: async (input: RegisterInput) =>
      (await http.post<Register | ProbationResult>("/attendance/registers/submit", input)).data,
    invalidate: [["attendance", "summary"], ["attendance", "unmarked"], ["dashboard"]],
    toastError: false,
  });
}

export function useRequestCorrection() {
  return useApiMutation({
    mutationFn: async (input: CorrectionInput) => (await http.post<unknown>("/attendance/corrections", input)).data,
    invalidate: [["approvals"]],
    success: "Correction sent to the principal for approval",
    toastError: false,
  });
}

export function useStudentAttendance(studentId: string, from: string, to: string) {
  return useQuery({
    queryKey: attendanceKeys.student(studentId, from, to),
    queryFn: async () =>
      (await http.get<StudentAttendance>(`/attendance/students/${studentId}`, { from, to })).data,
    placeholderData: keepPreviousData,
  });
}
