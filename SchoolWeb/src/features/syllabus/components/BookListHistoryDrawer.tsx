"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/format";
import type { BookList } from "../types";
import { useBookListHistory } from "../use-book-list-history";
import { BookItemsTable } from "./BookItemsTable";

export function BookListHistoryDrawer({ current, onClose }: { current: BookList; onClose: () => void }) {
  const { query, revisions, isExpanded, toggle } = useBookListHistory(current.id);

  return (
    <DetailDrawer
      open
      onOpenChange={(open) => !open && onClose()}
      title="Revision history"
      description={`Book list for ${current.className}`}
    >
      {query.isLoading && <Skeleton className="h-40 w-full" />}
      {query.error && <ErrorState error={query.error} onRetry={() => query.refetch()} />}
      {!query.isLoading && !query.error && revisions.length === 0 && <EmptyState title="No revisions yet" />}
      {revisions.map((item) => (
        <section key={item.id} className="flex flex-col gap-3 rounded-card border border-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-body font-semibold text-fg">Revision {item.revision}</span>
              <StatusBadge status={item.status} />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggle(item.id)}
              aria-expanded={isExpanded(item.id)}
              aria-label={`${isExpanded(item.id) ? "Hide" : "Show"} books of revision ${item.revision}`}
            >
              {isExpanded(item.id) ? <ChevronUp /> : <ChevronDown />}
              {item.items.length} {item.items.length === 1 ? "book" : "books"}
            </Button>
          </div>
          <p className="text-caption text-fg-muted">
            {item.approvedAt ? `Approved ${formatDate(item.approvedAt)}` : "Not approved"}
            {item.comment ? ` · ${item.comment}` : ""}
          </p>
          {isExpanded(item.id) && <BookItemsTable items={item.items} />}
        </section>
      ))}
    </DetailDrawer>
  );
}
