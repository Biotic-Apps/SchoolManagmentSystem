import { CountBadge } from "@/components/shared/CountBadge";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
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
        "flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors",
        "border-l-2",
        selected
          ? "border-primary bg-selected"
          : "border-transparent hover:bg-selected/50",
      )}
    >
      {/* Unread indicator dot */}
      <span className="flex shrink-0 items-center self-center w-2">
        {unread && (
          <span className="block size-2 rounded-full bg-primary" />
        )}
      </span>

      {/* Student avatar */}
      <PersonAvatar
        name={thread.student.name}
        photoUrl={undefined}
        size="md"
        className="shrink-0 self-center"
      />

      {/* Content */}
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        {/* Row 1: Subject + timestamp */}
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-label text-fg",
              unread ? "font-semibold" : "font-medium",
            )}
          >
            {thread.subject}
          </span>
          <span className="shrink-0 whitespace-nowrap text-caption text-fg-muted">
            {shortStamp(last?.at)}
          </span>
        </span>

        {/* Row 2: Student name + section */}
        <span className="truncate text-caption text-fg-muted">
          {section
            ? `${thread.student.name} · ${section}`
            : thread.student.name}
        </span>

        {/* Row 3: Last message preview + badges */}
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-caption",
              unread ? "text-fg" : "text-fg-muted",
            )}
          >
            {last
              ? `${last.senderName}: ${last.body}`
              : "No messages yet"}
          </span>
          {thread.closed && <Badge>Closed</Badge>}
          <CountBadge count={thread.unreadCount} />
        </span>
      </span>
    </button>
  );
}
