import type { ReactNode } from "react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { EMPTY_VALUE, formatDate, formatDateRange } from "@/lib/format";
import { LEAVE_STATUS_LABEL, LEAVE_TYPE_LABEL } from "./options";
import type { Leave } from "./types";

const dates: DataTableColumn<Leave> = {
  id: "dates",
  header: "Dates",
  className: "whitespace-nowrap",
  cell: (row) => formatDateRange(row.from, row.to),
};

const days: DataTableColumn<Leave> = {
  id: "days",
  header: "Days",
  className: "whitespace-nowrap text-right tabular-nums",
  cell: (row) => row.days,
};

const reason: DataTableColumn<Leave> = {
  id: "reason",
  header: "Reason",
  className: "min-w-48",
  cell: (row) => (
    <span className="block max-w-72 truncate" title={row.reason}>
      {row.reason}
    </span>
  ),
};

const status: DataTableColumn<Leave> = {
  id: "status",
  header: "Status",
  className: "whitespace-nowrap",
  cell: (row) => <StatusBadge status={row.status} label={LEAVE_STATUS_LABEL[row.status]} />,
};

const decision: DataTableColumn<Leave> = {
  id: "decision",
  header: "Decision note",
  className: "min-w-40",
  cell: (row) =>
    row.decidedBy ? (
      <span className="flex min-w-0 flex-col">
        <span className="truncate">{row.decidedBy.name}</span>
        {row.comment && (
          <span className="block max-w-64 truncate text-caption text-fg-muted" title={row.comment}>
            {row.comment}
          </span>
        )}
      </span>
    ) : (
      EMPTY_VALUE
    ),
};

function typeLabel(row: Leave): string {
  return row.type ? LEAVE_TYPE_LABEL[row.type] : row.kind === "STUDENT" ? "Student leave" : EMPTY_VALUE;
}

/** Review queue: who, when, why, and approve/reject actions. */
export function leaveReviewColumns(actions: (row: Leave) => ReactNode): DataTableColumn<Leave>[] {
  return [
    {
      id: "kind",
      header: "For",
      className: "whitespace-nowrap",
      cell: (row) => <Badge tone={row.kind === "STUDENT" ? "primary" : "info"}>{row.kind === "STUDENT" ? "Student" : "Staff"}</Badge>,
    },
    { id: "subject", header: "Name", className: "min-w-40 font-medium", cell: (row) => row.subject.name },
    dates,
    days,
    { id: "type", header: "Type", className: "whitespace-nowrap", cell: typeLabel },
    reason,
    {
      id: "requestedBy",
      header: "Requested by",
      className: "min-w-36",
      cell: (row) => (
        <span className="flex flex-col">
          <span className="truncate">{row.requestedBy.name}</span>
          <span className="whitespace-nowrap text-caption text-fg-muted">{formatDate(row.createdAt)}</span>
        </span>
      ),
    },
    status,
    // Pinned to the right edge so Approve / Reject stay visible when the table scrolls sideways.
    {
      id: "actions",
      header: "",
      className: "sticky right-0 w-px whitespace-nowrap bg-surface text-right shadow-[-8px_0_8px_-8px_rgb(0_0_0/0.15)]",
      cell: actions,
    },
  ];
}

/** Requester's own list (parent for a child, staff for self). */
export function myLeaveColumns(actions: (row: Leave) => ReactNode, withType: boolean): DataTableColumn<Leave>[] {
  return [
    dates,
    days,
    ...(withType ? [{ id: "type", header: "Type", className: "whitespace-nowrap", cell: typeLabel }] : []),
    reason,
    status,
    decision,
    // Pinned to the right edge so Approve / Reject stay visible when the table scrolls sideways.
    {
      id: "actions",
      header: "",
      className: "sticky right-0 w-px whitespace-nowrap bg-surface text-right shadow-[-8px_0_8px_-8px_rgb(0_0_0/0.15)]",
      cell: actions,
    },
  ];
}
