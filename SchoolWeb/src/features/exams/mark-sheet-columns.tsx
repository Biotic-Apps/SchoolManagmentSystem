import { MessageSquareWarning } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EMPTY_VALUE } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import { MARK_SHEET_STATUS_LABEL } from "./mark-options";
import type { MarkSheet } from "./types";

export function markSheetColumns(): DataTableColumn<MarkSheet>[] {
  return [
    {
      id: "section",
      header: "Class & section",
      className: "whitespace-nowrap",
      cell: (sheet) => `${sheet.paper.className} ${sheet.sectionName}`,
    },
    { id: "subject", header: "Subject", cell: (sheet) => sheet.paper.subject.name },
    { id: "teacher", header: "Teacher", cell: (sheet) => sheet.teacher?.name ?? EMPTY_VALUE },
    {
      id: "status",
      header: "Status",
      cell: (sheet) => (
        <span className="flex items-center gap-2">
          <StatusBadge status={sheet.status} label={MARK_SHEET_STATUS_LABEL[sheet.status]} />
          {sheet.status === "RETURNED" && sheet.comment && (
            <MessageSquareWarning className="size-4 text-warning" aria-label={`Returned: ${sheet.comment}`}>
              <title>{sheet.comment}</title>
            </MessageSquareWarning>
          )}
        </span>
      ),
    },
    {
      id: "entered",
      header: "Entered",
      className: `${NUMERIC_COLUMN} whitespace-nowrap`,
      cell: (sheet) => `${sheet.entered} / ${sheet.total}`,
    },
    {
      id: "progress",
      header: "Progress",
      className: "min-w-40",
      cell: (sheet) => (
        <ProgressBar
          percent={sheet.total ? (sheet.entered / sheet.total) * 100 : 0}
          tone={sheet.total > 0 && sheet.entered >= sheet.total ? "success" : "primary"}
          label={`Marks entered for ${sheet.paper.className} ${sheet.sectionName} ${sheet.paper.subject.name}`}
        />
      ),
    },
  ];
}
