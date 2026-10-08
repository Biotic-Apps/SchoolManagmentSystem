import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { timetableKeys } from "./api";
import type { CellInput, CellResult, TimetableBuilder } from "./builder-types";
import type { Timetable } from "./types";

export const builderSaveKey = (sectionId: string) => ["timetable-cell", sectionId] as const;

export function useTimetableBuilder(sectionId: string | null) {
  return useQuery({
    queryKey: timetableKeys.builder(sectionId ?? ""),
    queryFn: async () => (await http.get<TimetableBuilder>(`/timetables/${sectionId}/builder`)).data,
    enabled: !!sectionId,
  });
}

export interface CellTarget {
  day: number;
  periodIndex: number;
}

const cellPath = (sectionId: string, { day, periodIndex }: CellTarget) => `/timetables/${sectionId}/slots/${day}/${periodIndex}`;

export const putCell = async (sectionId: string, target: CellTarget, input: CellInput) =>
  (await http.put<CellResult>(cellPath(sectionId, target), input)).data;

export const deleteCell = async (sectionId: string, target: CellTarget) =>
  (await http.delete<CellResult>(cellPath(sectionId, target))).data;

// Classes overview shows each section's timetable state; keep it fresh after publish/discard.
const AFTER_PUBLISH = [timetableKeys.all, ["classes"]];

export function usePublishTimetable(sectionId: string) {
  return useApiMutation({
    mutationFn: () => http.post<Timetable>(`/timetables/${sectionId}/publish`),
    invalidate: AFTER_PUBLISH,
    success: "Timetable published. Teachers and parents can see it now.",
  });
}

export function useDiscardTimetable(sectionId: string) {
  return useApiMutation({
    mutationFn: () => http.post<Timetable>(`/timetables/${sectionId}/discard`),
    invalidate: AFTER_PUBLISH,
    success: "Changes discarded. The published timetable is back.",
  });
}
