import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { OverrideInput, Period, TeacherSlot, Timetable, TimetableOverride } from "./types";

// The contract shows `{ periods }` for PUT; accept either shape on GET.
type PeriodsResponse = Period[] | { periods: Period[] } | null;

function periodList(data: PeriodsResponse): Period[] {
  if (!data) return [];
  return Array.isArray(data) ? data : (data.periods ?? []);
}

export const timetableKeys = {
  all: ["timetable"] as const,
  periods: (branchId: string) => ["timetable", "periods", branchId] as const,
  section: (sectionId: string) => ["timetable", "section", sectionId] as const,
  builder: (sectionId: string) => ["timetable", "builder", sectionId] as const,
  bell: (branchId: string) => ["timetable", "bell", branchId] as const,
  mine: (weekOf: string, studentId: string | null) => ["timetable", "me", weekOf, studentId] as const,
  teacher: (staffId: string, weekOf: string) => ["timetable", "teacher", staffId, weekOf] as const,
  overrides: (branchId: string, date: string) => ["timetable", "overrides", branchId, date] as const,
};

export function usePeriods(branchId: string | null) {
  return useQuery({
    queryKey: timetableKeys.periods(branchId ?? ""),
    queryFn: async () => periodList((await http.get<PeriodsResponse>(`/branches/${branchId}/periods`)).data),
    enabled: !!branchId,
  });
}

export function useSectionTimetable(sectionId: string | null, enabled = true) {
  return useQuery({
    queryKey: timetableKeys.section(sectionId ?? ""),
    queryFn: async () => (await http.get<Timetable | null>("/timetables", { sectionId })).data,
    enabled: enabled && !!sectionId,
  });
}

export function useMyTimetable(weekOf: string, studentId: string | null = null, enabled = true) {
  return useQuery({
    queryKey: timetableKeys.mine(weekOf, studentId),
    queryFn: async () => (await http.get<TeacherSlot[]>("/timetables/me", { weekOf, studentId })).data ?? [],
    enabled,
  });
}

export function useTeacherTimetable(staffId: string | null, weekOf: string) {
  return useQuery({
    queryKey: timetableKeys.teacher(staffId ?? "", weekOf),
    queryFn: async () => (await http.get<TeacherSlot[]>(`/timetables/teacher/${staffId}`, { weekOf })).data ?? [],
    enabled: !!staffId,
  });
}

export function useOverrides(branchId: string | null, date: string) {
  return useQuery({
    queryKey: timetableKeys.overrides(branchId ?? "", date),
    queryFn: async () =>
      (await http.get<TimetableOverride[]>("/timetable-overrides", { branchId, date, pageSize: 100 })).data,
    placeholderData: keepPreviousData,
    enabled: !!branchId,
  });
}

export function useCreateOverride() {
  return useApiMutation({
    mutationFn: (input: OverrideInput) => http.post<TimetableOverride>("/timetable-overrides", input),
    invalidate: [timetableKeys.all],
    success: "Substitute assigned — teacher notified",
    toastError: false,
  });
}

export function useDeleteOverride() {
  return useApiMutation({
    mutationFn: (id: string) => http.delete(`/timetable-overrides/${id}`),
    invalidate: [timetableKeys.all],
    success: "Substitution removed",
  });
}
