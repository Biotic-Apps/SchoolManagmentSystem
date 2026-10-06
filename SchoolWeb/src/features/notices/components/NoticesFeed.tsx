"use client";

import { Megaphone } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useNoticeFeed } from "../use-notice-feed";
import { NoticeDetailDrawer } from "./NoticeDetailDrawer";
import { NoticeListItem } from "./NoticeListItem";

/** Every published notice addressed to me, pinned first (no page header; reused by Messages). */
export function NoticesFeed() {
  const { query, reader, notices } = useNoticeFeed();

  return (
    <>
      {query.isLoading && <Skeleton className="h-48 w-full" />}
      {!!query.error && (
        <Card>
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        </Card>
      )}
      {query.data && notices.length === 0 && (
        <Card>
          <EmptyState icon={Megaphone} title="No notices" description="Notices from the school appear here." />
        </Card>
      )}
      {notices.length > 0 && (
        <Card className="p-2">
          <ul className="flex flex-col divide-y divide-border">
            {notices.map((notice) => (
              <li key={notice.id}>
                <NoticeListItem notice={notice} unread={reader.isUnread(notice)} onOpen={reader.show} />
              </li>
            ))}
          </ul>
        </Card>
      )}
      <NoticeDetailDrawer notice={reader.notice} onOpenChange={reader.onOpenChange} />
    </>
  );
}
