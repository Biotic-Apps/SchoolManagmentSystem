"use client";

import { Check, Send, Undo2 } from "lucide-react";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { Button } from "@/components/ui/Button";
import type { ReviewActions } from "../use-review-actions";

interface ReviewControlsProps {
  review: ReviewActions;
  /** Shown in the approve dialog, e.g. who gets notified. */
  approveNote: string;
}

/** Submit / Approve / Return buttons with their comment dialogs; hidden when not allowed. */
export function ReviewControls({ review, approveNote }: ReviewControlsProps) {
  const busy = review.pending;
  return (
    <>
      {review.canSubmit && (
        <Button variant="secondary" size="sm" onClick={review.submit} loading={review.pendingAction === "submit"} disabled={busy}>
          <Send />
          Submit
        </Button>
      )}
      {review.canReview && (
        <>
          <Button size="sm" onClick={review.openApprove} disabled={busy}>
            <Check />
            Approve
          </Button>
          <Button variant="danger" size="sm" onClick={review.openReturn} disabled={busy}>
            <Undo2 />
            Return
          </Button>
        </>
      )}
      {review.dialog === "approve" && (
        <ReasonDialog
          open
          onOpenChange={(open) => !open && review.closeDialog()}
          title="Approve this revision?"
          description={approveNote}
          label="Comment"
          required={false}
          submitLabel="Approve"
          submitting={busy}
          onSubmit={review.confirm}
        />
      )}
      {review.dialog === "return" && (
        <ReasonDialog
          open
          onOpenChange={(open) => !open && review.closeDialog()}
          title="Return for changes"
          description="The author sees your comment and can edit the draft again."
          label="Comment"
          submitLabel="Return"
          submitting={busy}
          onSubmit={review.confirm}
        />
      )}
    </>
  );
}
