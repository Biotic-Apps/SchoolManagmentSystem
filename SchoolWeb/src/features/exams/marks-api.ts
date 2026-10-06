import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { examsKeys } from "./keys";
import type { MarkRowInput, MarkSheet, ProbationResult } from "./types";

const SHEET_LISTS = [
  ["exams", "mark-sheets"],
  ["exams", "mark-sheet"],
  ["exams", "completeness"],
  ["dashboard"],
];

export interface SaveMarkSheetInput {
  rows: MarkRowInput[];
  clientRequestId: string;
}

export function useMarkSheets(examId: string, params: Query) {
  return useQuery({
    queryKey: examsKeys.markSheets(examId, params),
    queryFn: () => http.get<MarkSheet[]>(`/exams/${examId}/mark-sheets`, params),
    placeholderData: keepPreviousData,
  });
}

export function useMarkSheet(id: string | null) {
  return useQuery({
    queryKey: examsKeys.markSheet(id),
    queryFn: async () => (await http.get<MarkSheet>(`/mark-sheets/${id}`)).data,
    enabled: !!id,
  });
}

/** Errors are shown by the editor (cell errors, pending rows), so no toast here. */
export function useSaveMarkSheet(id: string) {
  return useApiMutation({
    mutationFn: async (input: SaveMarkSheetInput) => (await http.put<MarkSheet>(`/mark-sheets/${id}`, input)).data,
    invalidate: [["exams", "mark-sheets"], ["exams", "completeness"]],
    toastError: false,
  });
}

export function useSubmitMarkSheet(id: string) {
  return useApiMutation({
    mutationFn: async () => (await http.post<MarkSheet | ProbationResult>(`/mark-sheets/${id}/submit`)).data,
    invalidate: [...SHEET_LISTS, ["approvals"]],
    toastError: false,
  });
}

export type MarkSheetReview = "accept" | "return";

export function useReviewMarkSheet(id: string) {
  return useApiMutation({
    mutationFn: async ({ action, comment }: { action: MarkSheetReview; comment?: string }) =>
      (await http.post<MarkSheet>(`/mark-sheets/${id}/${action}`, { comment })).data,
    invalidate: SHEET_LISTS,
    success: (_, vars) => (vars.action === "accept" ? "Mark sheet accepted" : "Mark sheet returned to the teacher"),
  });
}
