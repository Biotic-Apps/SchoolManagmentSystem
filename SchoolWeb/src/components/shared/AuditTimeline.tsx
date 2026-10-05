import { History } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import type { FieldChange } from "@/lib/audit-diff";
import { formatDateTime, humanize } from "@/lib/format";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

export interface AuditTimelineEntry {
  id: string;
  action: string;
  actorName: string;
  onBehalfOfName?: string | null;
  at: string;
  changes: FieldChange[];
}

interface AuditTimelineProps {
  entries: AuditTimelineEntry[] | undefined;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export function AuditTimeline({ entries, loading, error, onRetry }: AuditTimelineProps) {
  if (loading) return <Skeleton className="h-24 w-full" />;
  if (error) return <ErrorState error={error} onRetry={onRetry} className="py-6" />;
  if (!entries?.length) return <EmptyState icon={History} title="No history yet" className="py-6" />;

  return (
    <ol className="flex flex-col">
      {entries.map((entry) => (
        <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
          <span aria-hidden className="absolute bottom-0 left-[5px] top-4 w-px bg-border" />
          <span aria-hidden className="mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-primary bg-surface" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-label text-fg">
              <span className="font-medium">{humanize(entry.action)}</span> by {entry.actorName}
              {entry.onBehalfOfName && <span className="text-fg-muted"> on behalf of {entry.onBehalfOfName}</span>}
            </p>
            <p className="text-caption text-fg-muted">{formatDateTime(entry.at)}</p>
            {entry.changes.length > 0 && (
              <ul className="mt-1 flex flex-col gap-0.5 rounded-input bg-background px-3 py-2">
                {entry.changes.map((change) => (
                  <li key={change.field} className="break-words text-caption text-fg-muted">
                    <span className="font-medium text-fg">{humanize(change.field)}</span>: {change.from} → {change.to}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
