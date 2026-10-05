import { useState } from "react";
import { useSession } from "@/features/auth/session-context";
import { useMarkAllRead, useMarkRead, useRecentNotifications, useUnreadCount } from "./api";
import type { AppNotification } from "./types";

export function useNotificationBell() {
  const { status, isDemo } = useSession();
  const [open, setOpen] = useState(false);
  const live = status === "authenticated" && !isDemo;
  const unread = useUnreadCount(live);
  const recent = useRecentNotifications(live && open);
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();

  const count = unread.data ?? 0;

  return {
    open,
    setOpen,
    count,
    badge: count > 99 ? "99+" : String(count),
    items: recent.data,
    loading: recent.isLoading,
    error: recent.error,
    retry: () => recent.refetch(),
    onItemSelect: (item: AppNotification) => {
      if (!item.readAt) markRead.mutate(item.id);
    },
    markAllRead: () => markAll.mutate(),
    markingAll: markAll.isPending,
  };
}
