import { useQuery } from "@tanstack/react-query";
import { diaryKeys } from "@/features/diary/api";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { progressKeys } from "./keys";
import { listFrom } from "./list-from";
import type { HomeworkCompletionItem, HomeworkStatusEntry, ProgressNote, ProgressNoteInput } from "./types";

export function useProgressNotes(studentId: string | null) {
  return useQuery({
    queryKey: progressKeys.notes(studentId),
    queryFn: async () => listFrom<ProgressNote>((await http.get<unknown>(`/students/${studentId}/progress-notes`)).data),
    enabled: !!studentId,
  });
}

/** Probation-gated: may answer `{ status: "PENDING_REVIEW" }` instead of the note. */
export function useAddProgressNote(studentId: string) {
  return useApiMutation({
    mutationFn: async (input: ProgressNoteInput) =>
      (await http.post<unknown>(`/students/${studentId}/progress-notes`, input)).data,
    invalidate: [progressKeys.notes(studentId), ["approvals"]],
    toastError: false,
  });
}

export function useHomeworkCompletion(studentId: string | null, from: string, to: string) {
  return useQuery({
    queryKey: progressKeys.homework(studentId, from, to),
    queryFn: async () =>
      listFrom<HomeworkCompletionItem>(
        (await http.get<unknown>(`/students/${studentId}/homework-completion`, { from, to })).data,
      ),
    enabled: !!studentId,
  });
}

export function useSaveHomeworkStatus() {
  return useApiMutation({
    mutationFn: ({ diaryId, entries }: { diaryId: string; entries: HomeworkStatusEntry[] }) =>
      http.put(`/diary/${diaryId}/homework-status`, { entries }),
    invalidate: [diaryKeys.all, progressKeys.all],
    success: "Homework status saved",
  });
}
