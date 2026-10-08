import { ErrorState } from "@/components/shared/ErrorState";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatNumber } from "@/lib/format";
import { deletionLabel } from "./deletion-labels";
import type { SchoolDeletionPreview } from "./types";

interface DeletionPreviewListProps {
  preview: SchoolDeletionPreview | undefined;
  loading: boolean;
  error: unknown;
  onRetry: () => void;
}

/** "What will be removed" as a short two-column list. */
export function DeletionPreviewList({ preview, loading, error, onRetry }: DeletionPreviewListProps) {
  if (loading) return <Skeleton className="h-24 w-full" />;
  if (error || !preview) return <ErrorState error={error} onRetry={onRetry} />;

  return (
    <div className="flex flex-col gap-3">
      {preview.summary.length > 0 ? (
        <ul className="grid grid-cols-1 gap-x-4 gap-y-1.5 rounded-input border border-border bg-background px-3 py-2.5 text-label text-fg sm:grid-cols-2">
          {preview.summary.map((item) => (
            <li key={item.key} className="flex items-baseline gap-1.5">
              <span className="font-semibold tabular-nums">{formatNumber(item.count)}</span>
              <span className="text-fg-muted">{deletionLabel(item.key, item.count)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-label text-fg-muted">This school has no records yet.</p>
      )}
      {preview.keptUsers > 0 && (
        <p className="text-caption text-fg-muted">
          {formatNumber(preview.keptUsers)} {preview.keptUsers === 1 ? "person also works" : "people also work"} in
          another school and will keep {preview.keptUsers === 1 ? "their account" : "their accounts"}; only their
          access to this school is removed.
        </p>
      )}
      {preview.lastActiveSchool && (
        <InlineNotice tone="warning">
          This is the last active school. Afterwards only super admins will be able to sign in.
        </InlineNotice>
      )}
    </div>
  );
}
