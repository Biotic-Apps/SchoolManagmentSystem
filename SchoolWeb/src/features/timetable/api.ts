import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { Conflict, OverrideInput, Period, SlotInput, TeacherSlot, Timetable, TimetableOverride } from "./types";

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

export function useSavePeriods(branchId: string) {
  return useApiMutation({
    mutationFn: (periods: Period[]) => http.put<Period[]>(`/branches/${branchId}/periods`, { periods }),
    invalidate: [timetableKeys.all],
    success: "Bell schedule saved",
    toastError: false,
  });
}

export function useSectionTimetable(sectionId: string | null) {
  return useQuery({
    queryKey: timetableKeys.section(sectionId ?? ""),
    queryFn: async () => (await http.get<Timetable | null>("/timetables", { sectionId })).data,
    enabled: !!sectionId,
  });
}

export function useSaveSlots(sectionId: string) {
  return useApiMutation({
    mutationFn: ({ sessionId, slots }: { sessionId: string; slots: SlotInput[] }) =>
      http.put<Timetable>(`/timetables/${sectionId}/slots`, { sessionId, slots }),
    invalidate: [timetableKeys.section(sectionId)],
    success: "Draft saved",
  });
}

export function useCheckConflicts(sectionId: string) {
  return useApiMutation({
    mutationFn: async () => {
      const data = (await http.post<{ conflicts: Conflict[] } | Conflict[]>(`/timetables/${sectionId}/check`)).data;
      return (Array.isArray(data) ? data : data?.conflicts) ?? [];
    },
  });
}

/** 409 CONFLICT carries details.conflicts; the caller highlights them. */
export function usePublishTimetable(sectionId: string) {
  return useApiMutation({
    mutationFn: () => http.post<Timetable>(`/timetables/${sectionId}/publish`),
    invalidate: [timetableKeys.all],
    success: "Timetable published — teachers notified",
    toastError: false,
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
