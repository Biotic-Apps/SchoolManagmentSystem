"use client";

import { Check, Save, Send, Undo2 } from "lucide-react";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { Button } from "@/components/ui/Button";
import type { MarkSheetState } from "../../use-mark-sheet-panel";

/** Save draft / Submit for the teacher; Accept / Return for the reviewer. */
export function MarkSheetActions({ panel }: { panel: MarkSheetState }) {
  const { editor } = panel;
  const busy = panel.saving || panel.submitting;
  if (!panel.canEdit && !panel.canReview && !panel.canReturnAccepted) return null;

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {panel.canEdit && (
        <>
          {editor.dirty && <span className="text-label text-warning">Unsaved changes</span>}
          <Button
            variant="secondary"
            onClick={panel.saveDraft}
            loading={panel.saving}
            disabled={busy || !editor.dirty}
          >
            <Save />
            Save draft
          </Button>
          {panel.canSubmit && (
            <Button onClick={panel.submitSheet} loading={panel.submitting} disabled={busy}>
              <Send />
              Submit
            </Button>
          )}
        </>
      )}
      {(panel.canReview || panel.canReturnAccepted) && (
        <>
          {panel.canReview && panel.acceptBlockedReason && (
            <span className="text-label text-warning basis-full text-right">{panel.acceptBlockedReason}</span>
          )}
          <Button variant="secondary" onClick={() => panel.returnDialog.setOpen(true)} disabled={panel.reviewing}>
            <Undo2 />
            {panel.canReturnAccepted ? "Return to teacher" : "Return"}
          </Button>
          {panel.canReview && (
            <Button
              onClick={panel.accept}
              loading={panel.reviewing}
              disabled={!!panel.acceptBlockedReason}
              title={panel.acceptBlockedReason ?? undefined}
            >
              <Check />
              Accept
            </Button>
          )}
          <ReasonDialog
            open={panel.returnDialog.open}
            onOpenChange={panel.returnDialog.setOpen}
            title="Return mark sheet"
            description={
              panel.canReturnAccepted
                ? "This sheet was accepted. Returning it reopens it for the teacher; results must be computed again after it is accepted."
                : "The teacher sees your comment and can correct the marks before submitting again."
            }
            label="Comment"
            submitLabel="Return"
            submitting={panel.reviewing}
            onSubmit={panel.returnSheet}
          />
        </>
      )}
    </div>
  );
}
