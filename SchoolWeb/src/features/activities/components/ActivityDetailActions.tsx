import { Ban, Check, CircleCheckBig, Pencil, Play, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ActivityDetailState } from "../use-activity-detail";

export function ActivityDetailActions({ detail, onEdit }: { detail: ActivityDetailState; onEdit: () => void }) {
  const busy = detail.pending;
  return (
    <>
      {detail.canEdit && (
        <Button variant="secondary" size="sm" onClick={onEdit} disabled={busy}>
          <Pencil />
          Edit
        </Button>
      )}
      {detail.canReview && (
        <>
          <Button size="sm" onClick={detail.approve} loading={busy}>
            <Check />
            Approve
          </Button>
          <Button variant="danger" size="sm" onClick={detail.openReject} disabled={busy}>
            <X />
            Reject
          </Button>
        </>
      )}
      {detail.canStart && (
        <Button size="sm" onClick={detail.start} loading={busy}>
          <Play />
          Mark ongoing
        </Button>
      )}
      {detail.canComplete && (
        <Button size="sm" onClick={detail.complete} loading={busy}>
          <CircleCheckBig />
          Mark completed
        </Button>
      )}
      {detail.canCancel && (
        <Button variant="danger" size="sm" onClick={detail.openCancel} disabled={busy}>
          <Ban />
          Cancel
        </Button>
      )}
    </>
  );
}
