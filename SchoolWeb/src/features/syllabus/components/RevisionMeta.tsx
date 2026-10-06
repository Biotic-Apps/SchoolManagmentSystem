import { InlineNotice } from "@/components/shared/InlineNotice";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/format";
import type { ReviewStatus } from "../types";

interface RevisionMetaProps {
  status: ReviewStatus;
  revision: number;
  approvedAt?: string | null;
  comment?: string | null;
}

/** Status, revision number, approval date and the reviewer's comment of one revision. */
export function RevisionMeta({ status, revision, approvedAt, comment }: RevisionMetaProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 text-label text-fg-muted">
        <StatusBadge status={status} />
        <span>Revision {revision}</span>
        {approvedAt && <span>· Approved {formatDate(approvedAt)}</span>}
      </div>
      {comment && status === "RETURNED" && (
        <InlineNotice tone="warning">Returned for changes: {comment}</InlineNotice>
      )}
      {comment && status !== "RETURNED" && <p className="text-caption text-fg-muted">Reviewer comment: {comment}</p>}
    </div>
  );
}
