"use client";

import { AuditTimeline } from "@/components/shared/AuditTimeline";
import { useCan } from "@/features/auth/use-can";
import { useAuditLog } from "../api";
import { toTimelineEntry } from "../entry";
import { useAuditNames } from "../use-audit-names";

interface EntityHistoryProps {
  entityType: string;
  entityId: string | null;
  /** Names the page already knows by user id (e.g. the current principal), used before any lookup. */
  names?: Record<string, string>;
}

const NO_NAMES: Record<string, string> = {};

/** AuditTimeline for one record (GET /audit?entityType&entityId); hidden without audit.view. */
export function EntityHistory({ entityType, entityId, names = NO_NAMES }: EntityHistoryProps) {
  const can = useCan();
  const allowed = can("audit.view");
  const query = useAuditLog(entityType, entityId, allowed);
  const logs = query.data?.pages.flatMap((page) => page.logs) ?? [];
  const lookup = useAuditNames(logs, names);
  if (!allowed) return null;

  const entries = query.data ? logs.map((log) => toTimelineEntry(log, lookup)) : undefined;
  const total = query.data?.pages[0]?.meta?.total;

  return (
    <section aria-labelledby="entity-history-title" className="flex scroll-mt-4 flex-col gap-3">
      {/* Sticky inside the drawer's scroll body so the heading is never half-hidden at the top edge. */}
      <div className="sticky -top-5 z-10 -mx-1 -mt-5 flex items-baseline justify-between gap-3 bg-surface px-1 pb-2 pt-5">
        <h3 id="entity-history-title" className="text-body font-semibold text-fg">
          History
        </h3>
        {total ? <span className="text-caption text-fg-muted">{total === 1 ? "1 entry" : `${total} entries`}</span> : null}
      </div>
      <AuditTimeline
        entries={entries}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        hasMore={query.hasNextPage}
        loadingMore={query.isFetchingNextPage}
        onLoadMore={() => query.fetchNextPage()}
      />
    </section>
  );
}
