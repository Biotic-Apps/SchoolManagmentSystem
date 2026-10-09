import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/features/auth/session-context";
import { useMarkAllRead, useMarkRead, useRecentNotifications, useUnreadCount } from "./api";
import type { AppNotification } from "./types";

/** In-app path a notification opens, when its data carries one. */
function routeOf(item: AppNotification): string | null {
  const route = item.data?.route;
  return typeof route === "string" && route.startsWith("/") && !route.startsWith("//") ? route : null;
}

export function useNotificationBell() {
  const { status } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const live = status === "authenticated";
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
      const route = routeOf(item);
      if (route) {
        setOpen(false);
        router.push(route);
      }
    },
    markAllRead: () => markAll.mutate(),
    markingAll: markAll.isPending,
  };
}
