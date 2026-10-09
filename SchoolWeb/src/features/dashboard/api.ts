import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import type { ScopeValue } from "@/lib/scope";
import type { DashboardSummary, ParentHome, PendingCounts, TeacherToday } from "./types";

export function useDashboardSummary(scope: ScopeValue, enabled: boolean) {
  return useQuery({
    queryKey: ["dashboard", "summary", scope],
    queryFn: async () => (await http.get<DashboardSummary>("/dashboard/summary", { ...scope })).data,
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function usePendingCounts(branchId: string | null, date: string, enabled: boolean) {
  return useQuery({
    queryKey: ["dashboard", "pending", branchId, date],
    queryFn: async () => (await http.get<PendingCounts>("/dashboard/pending", { branchId, date })).data,
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useTeacherToday(enabled: boolean) {
  return useQuery({
    queryKey: ["dashboard", "teacher-today"],
    queryFn: async () => (await http.get<TeacherToday>("/dashboard/teacher-today")).data,
    enabled,
  });
}

export function useParentHome(studentId: string | null) {
  return useQuery({
    queryKey: ["dashboard", "parent-home", studentId],
    queryFn: async () => (await http.get<ParentHome>("/parent/home", { studentId })).data,
    enabled: !!studentId,
  });
}
