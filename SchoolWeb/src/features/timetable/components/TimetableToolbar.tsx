"use client";

import { Save, ScanSearch, Send } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/format";
import { STATUS_LABELS } from "../options";
import type { Timetable } from "../types";
import type { TimetableEditor } from "../use-timetable-editor";

interface TimetableToolbarProps {
  timetable: Timetable | null;
  editor: TimetableEditor;
  canEdit: boolean;
  canPublish: boolean;
}

export function TimetableToolbar({ timetable, editor, canEdit, canPublish }: TimetableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2 text-label text-fg-muted">
        {timetable ? (
          <>
            <StatusBadge status={timetable.status} label={STATUS_LABELS[timetable.status]} />
            <span>Version {timetable.version}</span>
            {timetable.publishedAt && <span>· Published {formatDateTime(timetable.publishedAt)}</span>}
          </>
        ) : (
          <Badge>Not created yet</Badge>
        )}
        {editor.dirty && <Badge tone="warning">Unsaved changes</Badge>}
      </div>
      <div className="flex flex-wrap gap-2">
        {canEdit && editor.dirty && (
          <Button variant="ghost" onClick={editor.discard} disabled={editor.saving}>
            Discard
          </Button>
        )}
        {canEdit && (
          <>
            <Button variant="secondary" onClick={editor.saveDraft} loading={editor.saving} disabled={!editor.dirty}>
              <Save />
              Save draft
            </Button>
            <Button variant="secondary" onClick={editor.runCheck} loading={editor.checking}>
              <ScanSearch />
              Check conflicts
            </Button>
          </>
        )}
        {canPublish && (
          <Button onClick={() => editor.publishDialog.show(true)}>
            <Send />
            Publish
          </Button>
        )}
      </div>
    </div>
  );
}
