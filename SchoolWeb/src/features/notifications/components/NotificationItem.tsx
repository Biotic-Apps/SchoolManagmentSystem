import { DropdownMenuItem } from "@/components/ui/DropdownMenu";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import type { AppNotification } from "../types";

interface NotificationItemProps {
  item: AppNotification;
  onSelect: (item: AppNotification) => void;
  /** Arrived while the panel was open: fades in gently. */
  fresh?: boolean;
}

export function NotificationItem({ item, onSelect, fresh }: NotificationItemProps) {
  const unread = !item.readAt;
  return (
    <DropdownMenuItem
      onSelect={(event) => {
        event.preventDefault();
        onSelect(item);
      }}
      className={cn("items-start gap-3 py-2.5", fresh && "animate-rise-in")}
    >
      <span
        aria-hidden
        className={cn(
          "mt-1.5 size-2 shrink-0 rounded-full transition-colors duration-(--dur-standard)",
          unread ? "bg-primary" : "bg-transparent",
        )}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn("text-label text-fg", unread && "font-medium")}>{item.title}</span>
        {item.body && <span className="line-clamp-2 text-caption text-fg-muted">{item.body}</span>}
        <span className="text-caption text-fg-muted">{formatDateTime(item.createdAt)}</span>
      </span>
      {unread && <span className="sr-only">Unread</span>}
    </DropdownMenuItem>
  );
}
