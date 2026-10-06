import { CountBadge } from "@/components/shared/CountBadge";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { classLabel, shortStamp } from "../format";
import type { Thread } from "../types";

interface ThreadRowProps {
  thread: Thread;
  selected: boolean;
  onSelect: () => void;
}

export function ThreadRow({ thread, selected, onSelect }: ThreadRowProps) {
  const unread = thread.unreadCount > 0;
  const section = classLabel(thread.student.className, thread.student.sectionName);
  const last = thread.lastMessage;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors",
        selected ? "bg-selected" : "hover:bg-selected/50",
      )}
    >
      <span className="flex items-center gap-2">
        <span className={cn("min-w-0 flex-1 truncate text-label text-fg", unread ? "font-semibold" : "font-medium")}>
          {thread.subject}
        </span>
        <span className="shrink-0 whitespace-nowrap text-caption text-fg-muted">{shortStamp(last?.at)}</span>
      </span>
      <span className="truncate text-caption text-fg-muted">
        {section ? `${thread.student.name} · ${section}` : thread.student.name}
      </span>
      <span className="flex items-center gap-2">
        <span className={cn("min-w-0 flex-1 truncate text-caption", unread ? "text-fg" : "text-fg-muted")}>
          {last ? `${last.senderName}: ${last.body}` : "No messages yet"}
        </span>
        {thread.closed && <Badge>Closed</Badge>}
        <CountBadge count={thread.unreadCount} />
      </span>
    </button>
  );
}
