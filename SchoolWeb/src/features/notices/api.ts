import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { withRowFlash } from "@/lib/row-highlight";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { Notice, NoticeInput, NoticeReads } from "./types";

export const noticeKeys = {
  all: ["notices"] as const,
  list: (params: Query) => ["notices", "list", params] as const,
  feed: ["notices", "feed"] as const,
  reads: (id: string) => ["notices", "reads", id] as const,
};

export function useNotices(params: Query, enabled = true) {
  return useQuery({
    queryKey: noticeKeys.list(params),
    queryFn: () => http.get<Notice[]>("/notices", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** Recipient view: the API only returns PUBLISHED notices addressed to the caller. */
export function useNoticeFeedQuery() {
  return useQuery({
    queryKey: noticeKeys.feed,
    queryFn: async () => (await http.get<Notice[]>("/notices", { status: "PUBLISHED", pageSize: 100 })).data,
  });
}

export function useNoticeReads(id: string | null) {
  return useQuery({
    queryKey: noticeKeys.reads(id ?? ""),
    queryFn: async () => (await http.get<NoticeReads>(`/notices/${id}/reads`)).data,
    enabled: !!id,
  });
}

export function useSaveNotice() {
  return useApiMutation({
    mutationFn: withRowFlash(
      async ({ id, input }: { id?: string; input: NoticeInput }) =>
        (id ? await http.patch<Notice>(`/notices/${id}`, input) : await http.post<Notice>("/notices", input)).data,
      (row, vars) => vars.id ?? row.id,
    ),
    invalidate: [noticeKeys.all],
    toastError: false,
  });
}

/** Teachers may get PENDING_REVIEW back (principal approval). */
export function usePublishNotice() {
  return useApiMutation({
    mutationFn: async (id: string) => (await http.post<Notice>(`/notices/${id}/publish`)).data,
    invalidate: [noticeKeys.all, ["approvals"]],
  });
}

export function useMarkNoticeRead() {
  return useApiMutation({
    mutationFn: (id: string) => http.post(`/notices/${id}/read`),
    invalidate: [noticeKeys.feed, ["dashboard"]],
    toastError: false,
  });
}
