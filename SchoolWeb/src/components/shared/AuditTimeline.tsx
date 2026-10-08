"use client";

import { History } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { groupByDay } from "@/lib/audit/timeline";
import { AuditEntry, type AuditTimelineEntry } from "./audit/AuditEntry";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

export type { AuditTimelineEntry } from "./audit/AuditEntry";

interface AuditTimelineProps {
  entries: AuditTimelineEntry[] | undefined;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

/** Audit entries as a day-grouped timeline, newest first, with "Show more" paging. */
export function AuditTimeline({ entries, loading, error, onRetry, hasMore, loadingMore, onLoadMore }: AuditTimelineProps) {
  if (loading) return <Skeleton className="h-24 w-full" />;
  if (error && !entries?.length) return <ErrorState error={error} onRetry={onRetry} className="py-6" />;
  if (!entries?.length) return <EmptyState icon={History} title="No history yet" className="py-6" />;

  return (
    <div className="flex flex-col gap-5">
      {groupByDay(entries).map((group) => (
        <section key={group.key} aria-label={group.label} className="flex flex-col gap-3">
          <h4 className="text-caption font-semibold uppercase tracking-wide text-fg-muted">{group.label}</h4>
          <ol className="flex flex-col">
            {group.entries.map((entry) => (
              <AuditEntry key={entry.id} entry={entry} />
            ))}
          </ol>
        </section>
      ))}
      {hasMore && onLoadMore && (
        <Button variant="secondary" size="sm" className="self-start" onClick={onLoadMore} loading={loadingMore}>
          Show more
        </Button>
      )}
    </div>
  );
}
