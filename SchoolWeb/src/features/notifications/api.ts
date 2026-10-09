import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { AppNotification } from "./types";

/** Unread badge refresh; there is no push channel to the browser yet. */
const POLL_MS = 20_000;
const RECENT_COUNT = 10;

export const notificationKeys = {
  all: ["notifications"] as const,
  unread: ["notifications", "unread-count"] as const,
  recent: ["notifications", "recent"] as const,
};

export function useUnreadCount(enabled: boolean) {
  return useQuery({
    queryKey: notificationKeys.unread,
    queryFn: async () => (await http.get<{ count: number }>("/notifications/unread-count")).data.count,
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: false,
    enabled,
  });
}

export function useRecentNotifications(enabled: boolean) {
  return useQuery({
    queryKey: notificationKeys.recent,
    queryFn: async () => (await http.get<AppNotification[]>("/notifications", { page: 1, pageSize: RECENT_COUNT })).data,
    // While the list is open, new items appear without closing it.
    refetchInterval: POLL_MS,
    enabled,
  });
}

export function useMarkRead() {
  return useApiMutation({
    mutationFn: (id: string) => http.post(`/notifications/${id}/read`),
    invalidate: [notificationKeys.all],
  });
}

export function useMarkAllRead() {
  return useApiMutation({
    mutationFn: () => http.post("/notifications/read-all"),
    invalidate: [notificationKeys.all],
    success: "All notifications marked as read",
  });
}
