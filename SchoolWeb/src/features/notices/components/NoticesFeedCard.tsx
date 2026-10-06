"use client";

import Link from "next/link";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useNoticeFeed } from "../use-notice-feed";
import { NoticeDetailDrawer } from "./NoticeDetailDrawer";
import { NoticeListItem } from "./NoticeListItem";

const LIMIT = 5;

/** Dashboard card: the five most recent notices addressed to me. */
export function NoticesFeedCard() {
  const { query, reader, notices, hasNoticesMenu } = useNoticeFeed(LIMIT);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle>Latest notices</CardTitle>
        {hasNoticesMenu && (
          <Button asChild variant="ghost" size="sm" className="text-primary">
            <Link href="/notices">View all</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="px-3 pt-3">
        {query.isLoading && <Skeleton className="mx-3 h-24" />}
        {!!query.error && <ErrorState error={query.error} onRetry={() => query.refetch()} />}
        {query.data && notices.length === 0 && (
          <p className="px-3 py-4 text-label text-fg-muted">No notices right now.</p>
        )}
        {notices.length > 0 && (
          <ul className="flex flex-col divide-y divide-border">
            {notices.map((notice) => (
              <li key={notice.id}>
                <NoticeListItem notice={notice} unread={reader.isUnread(notice)} onOpen={reader.show} compact />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <NoticeDetailDrawer notice={reader.notice} onOpenChange={reader.onOpenChange} />
    </Card>
  );
}
