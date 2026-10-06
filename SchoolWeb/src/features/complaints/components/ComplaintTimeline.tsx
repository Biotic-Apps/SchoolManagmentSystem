import { History } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime } from "@/lib/format";
import type { Complaint } from "../types";

export function ComplaintTimeline({ complaint }: { complaint: Complaint }) {
  if (!complaint.updates.length) return <EmptyState icon={History} title="No updates yet" className="py-6" />;
  // Without an author the update is either from an anonymous complainant or from the system.
  const unnamed = complaint.complainant ? "System" : "Anonymous";

  return (
    <ol className="flex flex-col">
      {complaint.updates.map((update) => (
        <li key={update.id} className="relative flex gap-3 pb-5 last:pb-0">
          <span aria-hidden className="absolute bottom-0 left-[5px] top-4 w-px bg-border" />
          <span aria-hidden className="mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-primary bg-surface" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-label font-medium text-fg">{update.author?.name ?? unnamed}</span>
              {update.status && <StatusBadge status={update.status} />}
            </div>
            <p className="whitespace-nowrap text-caption text-fg-muted">{formatDateTime(update.at)}</p>
            {update.message && (
              <p className="whitespace-pre-wrap break-words text-label text-fg">{update.message}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
