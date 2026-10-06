"use client";

import { ErrorState } from "@/components/shared/ErrorState";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { useReportUnsaved } from "@/components/shared/UnsavedChangesGuard";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Exam } from "../../types";
import { useMarkSheetPanel } from "../../use-mark-sheet-panel";
import { MarkGrid } from "./MarkGrid";
import { MarkSheetActions } from "./MarkSheetActions";
import { MarkSheetBanner } from "./MarkSheetBanner";
import { MarkSheetSummary } from "./MarkSheetSummary";

/** Marks entry grid for one class-section × subject sheet. */
export function MarkSheetEditor({ exam, sheetId }: { exam: Exam; sheetId: string }) {
  const panel = useMarkSheetPanel(exam, sheetId);
  const { sheet, query } = panel;
  useReportUnsaved(panel.editor.dirty);

  if (query.isLoading) return <Skeleton className="h-96 w-full" />;
  if (query.error || !sheet) {
    return (
      <Card>
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <MarkSheetSummary sheet={sheet} editor={panel.editor} />
        <MarkSheetActions panel={panel} />
      </div>
      <MarkSheetBanner exam={exam} sheet={sheet} editable={panel.canEdit} />
      {panel.notice && <InlineNotice tone="error">{panel.notice}</InlineNotice>}
      <MarkGrid editor={panel.editor} editable={panel.canEdit} flagged={panel.flagged} />
    </div>
  );
}
