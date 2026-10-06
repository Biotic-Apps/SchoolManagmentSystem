"use client";

import { Check, Save, Send, Undo2 } from "lucide-react";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { Button } from "@/components/ui/Button";
import type { MarkSheetState } from "../../use-mark-sheet-panel";

/** Save draft / Submit for the teacher; Accept / Return for the reviewer. */
export function MarkSheetActions({ panel }: { panel: MarkSheetState }) {
  const { editor } = panel;
  const busy = panel.saving || panel.submitting;
  if (!panel.canEdit && !panel.canReview) return null;

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
      {panel.canReview && (
        <>
          <Button variant="secondary" onClick={() => panel.returnDialog.setOpen(true)} disabled={panel.reviewing}>
            <Undo2 />
            Return
          </Button>
          <Button onClick={panel.accept} loading={panel.reviewing}>
            <Check />
            Accept
          </Button>
          <ReasonDialog
            open={panel.returnDialog.open}
            onOpenChange={panel.returnDialog.setOpen}
            title="Return mark sheet"
            description="The teacher sees your comment and can correct the marks before submitting again."
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
