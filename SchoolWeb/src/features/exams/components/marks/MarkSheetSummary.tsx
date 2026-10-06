import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import { MARK_SHEET_STATUS_LABEL, markSheetTitle } from "../../mark-options";
import type { MarkSheet } from "../../types";
import type { MarkSheetEditorState } from "../../use-mark-sheet-editor";

/** Sheet title, paper limits and live entered / pending / absent counts. */
export function MarkSheetSummary({ sheet, editor }: { sheet: MarkSheet; editor: MarkSheetEditorState }) {
  const { counts } = editor;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-card-title font-semibold text-fg">{markSheetTitle(sheet)}</h3>
        <StatusBadge status={sheet.status} label={MARK_SHEET_STATUS_LABEL[sheet.status]} />
      </div>
      <p className="text-label text-fg-muted">
        Max marks {sheet.paper.maxMarks} · Pass marks {sheet.paper.passMarks}
        {sheet.paper.date ? ` · Paper on ${formatDate(sheet.paper.date)}` : ""}
        {sheet.teacher ? ` · ${sheet.teacher.name}` : ""}
      </p>
      <div className="flex flex-wrap items-center gap-2" aria-label="Mark entry totals">
        <Badge tone="success" className="px-3 py-1 text-label">
          Entered <span className="font-semibold tabular-nums">{counts.entered}</span>
        </Badge>
        <Badge tone="info" className="px-3 py-1 text-label">
          Absent <span className="font-semibold tabular-nums">{counts.absent}</span>
        </Badge>
        <Badge tone={counts.pending > 0 ? "warning" : "neutral"} className="px-3 py-1 text-label">
          Pending <span className="font-semibold tabular-nums">{counts.pending}</span>
        </Badge>
        <Badge tone="neutral" className="px-3 py-1 text-label">
          Total <span className="font-semibold tabular-nums">{counts.total}</span>
        </Badge>
      </div>
    </div>
  );
}
