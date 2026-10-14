import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { DiaryEntry, DiaryInput, MissingDiary } from "./types";

export const diaryKeys = {
  all: ["diary"] as const,
  list: (params: Query) => ["diary", "list", params] as const,
  missing: (branchId: string | null, date: string) => ["diary", "missing", branchId, date] as const,
};

export function useDiaryEntries(params: Query, enabled = true) {
  return useQuery({
    queryKey: diaryKeys.list(params),
    queryFn: async () => (await http.get<DiaryEntry[]>("/diary", params)).data,
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useMissingDiaries(branchId: string | null, date: string, enabled = true) {
  return useQuery({
    queryKey: diaryKeys.missing(branchId, date),
    queryFn: async () => (await http.get<MissingDiary[]>("/diary/missing", { branchId, date })).data,
    enabled: enabled && !!branchId,
  });
}

/** PUT upserts the DRAFT (or revises a PUBLISHED entry before closing time). */
export function useSaveDiary() {
  return useApiMutation({
    mutationFn: async (input: DiaryInput) => (await http.put<DiaryEntry>("/diary", input)).data,
    invalidate: [diaryKeys.all],
    toastError: false,
  });
}

/** Result status: PUBLISHED, SUBMITTED (moderation) or PENDING_REVIEW (probation). */
export function usePublishDiary() {
  return useApiMutation({
    mutationFn: async (id: string) => (await http.post<{ status: string }>(`/diary/${id}/publish`)).data,
    invalidate: [diaryKeys.all, ["approvals"], ["dashboard"]],
    toastError: false,
  });
}

/**
 * Moderator approves a SUBMITTED entry: decides its approval (the API publishes it once
 * the last step approves). /publish only accepts DRAFT/RETURNED, so it is the fallback.
 */
export function useApproveDiary() {
  return useApiMutation({
    mutationFn: async (entry: DiaryEntry) => {
      if (!entry.approvalId) return (await http.post<{ status: string }>(`/diary/${entry.id}/publish`)).data;
      const approval = (
        await http.post<{ status: string }>(`/approvals/${entry.approvalId}/decide`, { decision: "APPROVED" })
      ).data;
      return { status: approval.status === "APPROVED" ? "PUBLISHED" : "SUBMITTED" };
    },
    invalidate: [diaryKeys.all, ["approvals"], ["dashboard"], ["notifications"]],
    toastError: false,
  });
}

export function useReturnDiary() {
  return useApiMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) => http.post(`/diary/${id}/return`, { comment }),
    invalidate: [diaryKeys.all, ["approvals"]],
    success: "Returned to the teacher",
  });
}
