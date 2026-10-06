import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import type { ScopeValue } from "@/lib/scope";
import type { ChildToday, DashboardSummary, PendingCounts, TeacherToday } from "./types";

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

export function useChildToday(studentId: string | null) {
  return useQuery({
    queryKey: ["dashboard", "child-today", studentId],
    queryFn: async () => (await http.get<ChildToday>("/dashboard/child-today", { studentId })).data,
    enabled: !!studentId,
  });
}
