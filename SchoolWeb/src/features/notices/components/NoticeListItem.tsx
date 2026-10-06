import { Pin } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { focusRing } from "@/components/ui/styles";
import { excerpt } from "../options";
import type { Notice } from "../types";

interface NoticeListItemProps {
  notice: Notice;
  unread: boolean;
  onOpen: (notice: Notice) => void;
  compact?: boolean;
}

export function NoticeListItem({ notice, unread, onOpen, compact }: NoticeListItemProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(notice)}
      className={cn(
        "flex w-full items-start gap-3 rounded-input px-3 py-3 text-left transition-colors hover:bg-selected/60",
        focusRing,
      )}
    >
      <span
        aria-label={unread ? "Unread" : undefined}
        className={cn("mt-2 size-2 shrink-0 rounded-full", unread ? "bg-primary" : "bg-transparent")}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex min-w-0 items-center gap-2">
          {notice.pinned && <Pin className="size-3.5 shrink-0 text-primary" aria-label="Pinned" />}
          <span className={cn("truncate text-label text-fg", unread ? "font-semibold" : "font-medium")}>
            {notice.title}
          </span>
        </span>
        {!compact && <span className="line-clamp-2 text-caption text-fg-muted">{excerpt(notice.body)}</span>}
      </span>
      <span className="shrink-0 whitespace-nowrap text-caption text-fg-muted">
        {formatDate(notice.publishedAt ?? notice.createdAt)}
      </span>
    </button>
  );
}
