"use client";

import { CheckCheck, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { RegisterTabState } from "../use-register-tab";

/** Mark-all shortcuts plus Save draft / Submit, with an unsaved-changes hint. */
export function RegisterActions({ tab }: { tab: RegisterTabState }) {
  const { editor } = tab;
  const busy = tab.saving || tab.submitting;
  const hasUnmarked = editor.counts.unmarked > 0;
  const hasMarked = editor.rows.length > editor.counts.unmarked;

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={() => editor.markAll("PRESENT", false)} disabled={busy}>
          <CheckCheck />
          Mark all present
        </Button>
        {hasUnmarked && hasMarked && (
          <Button variant="ghost" onClick={() => editor.markAll("PRESENT", true)} disabled={busy}>
            Mark remaining present
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {editor.dirty && <span className="text-label text-warning">Unsaved changes</span>}
        {!editor.dirty && tab.canSubmit && hasUnmarked && (
          <span className="text-label text-fg-muted">Mark every student to submit</span>
        )}
        <Button variant="secondary" onClick={tab.saveDraft} loading={tab.saving} disabled={busy || !editor.dirty}>
          <Save />
          Save draft
        </Button>
        {tab.canSubmit && (
          <Button onClick={tab.submitRegister} loading={tab.submitting} disabled={busy || !editor.allMarked}>
            <Send />
            Submit
          </Button>
        )}
      </div>
    </div>
  );
}
