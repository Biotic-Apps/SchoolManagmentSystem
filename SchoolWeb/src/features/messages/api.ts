import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { NewThreadInput, SendMessageInput, SendResult, Thread, ThreadDetail } from "./types";

export const MESSAGE_PAGE_SIZE = 30;

export const messageKeys = {
  all: ["messages"] as const,
  threads: (params: Query) => ["messages", "threads", params] as const,
  thread: (id: string) => ["messages", "thread", id] as const,
};

interface CursorMeta {
  hasMore?: boolean;
  nextCursor?: string | null;
}

export function useThreads(params: Query, enabled = true) {
  return useQuery({
    queryKey: messageKeys.threads(params),
    queryFn: async () => (await http.get<Thread[]>("/messages/threads", { pageSize: 100, ...params })).data,
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** Newest page first; "Load earlier" fetches the page before the oldest loaded message. */
export function useThreadMessages(id: string | null, scope?: string) {
  return useInfiniteQuery({
    queryKey: [...messageKeys.thread(id ?? ""), scope ?? "own"],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const result = await http.get<ThreadDetail, CursorMeta>(`/messages/threads/${id}`, {
        before: pageParam,
      });
      return { ...result.data, cursor: result.meta };
    },
    getNextPageParam: (page) => {
      const oldest = sortBySent(page.messages)[0];
      const more = page.cursor?.hasMore ?? page.messages.length >= MESSAGE_PAGE_SIZE;
      return more && oldest ? (page.cursor?.nextCursor ?? oldest.sentAt) : undefined;
    },
    enabled: !!id,
  });
}

export function sortBySent<T extends { sentAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sentAt.localeCompare(b.sentAt));
}

export function useCreateThread() {
  return useApiMutation({
    mutationFn: async (input: NewThreadInput) => (await http.post<Thread & SendResult>("/messages/threads", input)).data,
    invalidate: [messageKeys.all, ["dashboard"]],
    toastError: false,
  });
}

export function useSendMessage(threadId: string) {
  return useApiMutation({
    mutationFn: async (input: SendMessageInput) =>
      (await http.post<SendResult>(`/messages/threads/${threadId}/messages`, input)).data,
    invalidate: [messageKeys.all],
    toastError: false,
  });
}

export function useMarkThreadRead() {
  return useApiMutation({
    mutationFn: (threadId: string) => http.post(`/messages/threads/${threadId}/read`),
    invalidate: [["messages", "threads"], ["dashboard"], ["notifications"]],
    toastError: false,
  });
}
