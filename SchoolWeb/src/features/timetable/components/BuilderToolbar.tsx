"use client";

import { Send, Undo2 } from "lucide-react";
import { SaveIndicator } from "@/components/shared/SaveIndicator";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { stateLabel } from "../timetable-state";
import type { BuilderState } from "../use-timetable-builder";

const TONE = { EMPTY: "neutral", DRAFT: "warning", PUBLISHED: "success", PUBLISHED_WITH_CHANGES: "info" } as const;

/** State badge and save status on the left; Discard changes and Publish (with the reason when it's off) on the right. */
export function BuilderToolbar({ view }: { view: BuilderState }) {
  const { blocked } = view;
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={TONE[view.state]}>{stateLabel(view.builder.timetable)}</Badge>
        {view.canEdit && <SaveIndicator status={view.saveStatus} />}
        {!view.canEdit && <span className="text-caption text-fg-muted">View only</span>}
      </div>
      {view.canEdit && (
        <div className="flex flex-col items-start gap-1 md:items-end">
          <div className="flex flex-wrap gap-2">
            {view.showDiscard && (
              <Button variant="ghost" onClick={() => view.discardDialog.show(true)} disabled={view.discarding}>
                <Undo2 />
                Discard changes
              </Button>
            )}
            <Button onClick={view.publish} disabled={!!blocked} loading={view.publishing} title={blocked ?? undefined}>
              <Send />
              Publish
            </Button>
          </div>
          {blocked && (
            <span className="text-caption text-fg-muted" aria-live="polite">
              {blocked}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
