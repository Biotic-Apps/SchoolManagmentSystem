"use client";

import { Bell, BellOff } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Skeleton } from "@/components/ui/Skeleton";
import { useNotificationBell } from "../use-notification-bell";
import { NotificationItem } from "./NotificationItem";

export function NotificationBell() {
  const bell = useNotificationBell();
  const label = bell.count ? `Notifications, ${bell.count} unread` : "Notifications";

  return (
    <DropdownMenu open={bell.open} onOpenChange={bell.setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={label} className="relative">
          <Bell />
          {bell.count > 0 && (
            // Keyed by the count: a new number fades in softly instead of snapping.
            <span
              key={bell.badge}
              aria-hidden
              className="absolute right-1 top-1 grid h-4 min-w-4 animate-fade-in place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-on-primary"
            >
              {bell.badge}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[min(360px,calc(100vw-32px))] p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="px-0 text-label font-medium text-fg">Notifications</DropdownMenuLabel>
          {bell.count > 0 && (
            <Button variant="ghost" size="sm" onClick={bell.markAllRead} loading={bell.markingAll}>
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="my-0" />
        <div className="max-h-96 overflow-y-auto p-1">
          {bell.loading && <Skeleton className="m-2 h-16" />}
          {bell.error && <ErrorState error={bell.error} onRetry={bell.retry} className="py-6" />}
          {bell.items?.length === 0 && <EmptyState icon={BellOff} title="You're all caught up" className="py-8" />}
          {bell.items?.map((item) => (
            <NotificationItem key={item.id} item={item} onSelect={bell.onItemSelect} fresh={bell.isFresh(item)} />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
