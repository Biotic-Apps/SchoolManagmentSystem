import type { ReactNode } from "react";
import { BookOpen, CalendarClock, MessageSquareWarning } from "lucide-react";
import { AttachmentList } from "@/components/shared/AttachmentList";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/format";
import type { DiaryEntry } from "../types";

interface DiaryEntryCardProps {
  entry: DiaryEntry;
  /** Staff view: status, revision, author and review comment. */
  showMeta?: boolean;
  actions?: ReactNode;
}

export function DiaryEntryCard({ entry, showMeta, actions }: DiaryEntryCardProps) {
  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <BookOpen className="size-4 shrink-0 text-primary" />
            <h3 className="text-card-title font-semibold text-fg">{entry.subject.name}</h3>
            {showMeta && <StatusBadge status={entry.status} />}
            {showMeta && entry.revision > 1 && <Badge tone="neutral">Revision {entry.revision}</Badge>}
          </div>
          {showMeta && (
            <p className="text-caption text-fg-muted">
              By {entry.author.name}
              {entry.onBehalfOf ? ` on behalf of ${entry.onBehalfOf.name}` : ""}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
      {showMeta && entry.status === "RETURNED" && entry.comment && (
        <InlineNotice tone="warning">
          <span className="inline-flex items-start gap-1.5">
            <MessageSquareWarning className="mt-0.5 size-4 shrink-0" />
            {entry.comment}
          </span>
        </InlineNotice>
      )}
      <div className="flex flex-col gap-1">
        <span className="text-caption font-medium text-fg-muted">Topics covered</span>
        <p className="whitespace-pre-line text-body text-fg">{entry.topics}</p>
      </div>
      {entry.homework && (
        <div className="flex flex-col gap-1 rounded-input bg-background p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-caption font-medium text-fg-muted">Homework</span>
            {entry.dueDate && (
              <span className="inline-flex items-center gap-1 whitespace-nowrap text-caption text-fg-muted">
                <CalendarClock className="size-3.5" />
                Due {formatDate(entry.dueDate)}
              </span>
            )}
          </div>
          <p className="whitespace-pre-line text-body text-fg">{entry.homework}</p>
        </div>
      )}
      <AttachmentList items={entry.attachments} />
    </Card>
  );
}
