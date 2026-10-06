"use client";

import type { ReactNode } from "react";
import { Pin } from "lucide-react";
import { AttachmentList } from "@/components/shared/AttachmentList";
import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Notice } from "../types";

interface NoticeDetailDrawerProps {
  notice: Notice | null;
  onOpenChange: (open: boolean) => void;
  /** Management view shows the status badge and row actions. */
  showStatus?: boolean;
  actions?: ReactNode;
}

export function NoticeDetailDrawer({ notice, onOpenChange, showStatus, actions }: NoticeDetailDrawerProps) {
  const when = notice?.publishedAt ?? notice?.createdAt;
  return (
    <DetailDrawer
      open={!!notice}
      onOpenChange={onOpenChange}
      title={notice?.title ?? "Notice"}
      description={
        notice && (
          <span className="flex flex-wrap items-center gap-2">
            {when && <span className="whitespace-nowrap">{formatDateTime(when)}</span>}
            {notice.author && <span>· {notice.author.name}</span>}
            {notice.pinned && (
              <Badge tone="primary">
                <Pin className="size-3" />
                Pinned
              </Badge>
            )}
            {showStatus && <StatusBadge status={notice.status} />}
          </span>
        )
      }
      actions={actions}
    >
      {notice && (
        <>
          <p className="whitespace-pre-line text-body text-fg">{notice.body}</p>
          <AttachmentList items={notice.attachments} />
          {notice.expiresOn && (
            <p className="text-caption text-fg-muted">Shown until {formatDate(notice.expiresOn)}</p>
          )}
        </>
      )}
    </DetailDrawer>
  );
}
