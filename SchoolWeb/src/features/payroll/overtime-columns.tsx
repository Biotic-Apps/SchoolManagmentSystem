import { Check, Trash2, X } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { designationLabel } from "@/features/staff/options";
import { formatDate } from "@/lib/format";
import { hoursText } from "./options";
import type { OvertimeEntry } from "./types";

interface OvertimeColumnOptions {
  canApprove: boolean;
  canEdit: boolean;
  locked: boolean;
  onDecide: (entry: OvertimeEntry, decision: "APPROVED" | "REJECTED") => void;
  onRemove: (entry: OvertimeEntry) => void;
}

export function overtimeColumns({ canApprove, canEdit, locked, onDecide, onRemove }: OvertimeColumnOptions): DataTableColumn<OvertimeEntry>[] {
  return [
    {
      id: "staff",
      header: "Staff",
      className: "min-w-44",
      cell: (row) => (
        <span className="flex flex-col">
          <span className="font-medium text-fg">{row.staff.name}</span>
          <span className="text-caption text-fg-muted">{designationLabel(row.designation)}</span>
        </span>
      ),
    },
    { id: "date", header: "Date", className: "whitespace-nowrap", cell: (row) => formatDate(row.date) },
    { id: "hours", header: "Extra time", className: "whitespace-nowrap font-medium", cell: (row) => hoursText(row.minutes) },
    {
      id: "source",
      header: "From",
      className: "min-w-48",
      cell: (row) => (
        <span className="flex flex-col">
          <span>{row.source === "ATTENDANCE" ? `Attendance (left at ${row.checkOut ?? "?"})` : "Added by hand"}</span>
          {row.reason && <span className="text-caption text-fg-muted">{row.reason}</span>}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      className: "whitespace-nowrap",
      cell: (row) => (
        <span className="flex flex-col gap-0.5">
          <StatusBadge status={row.status} />
          {row.decidedBy && <span className="text-caption text-fg-muted">by {row.decidedBy.name}</span>}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => (
        <RowActions
          label={`Actions for ${row.staff.name}`}
          actions={[
            { id: "approve", label: "Approve", icon: Check, onSelect: () => onDecide(row, "APPROVED"), hidden: !canApprove || locked || row.status === "APPROVED" },
            { id: "reject", label: "Reject", icon: X, onSelect: () => onDecide(row, "REJECTED"), hidden: !canApprove || locked || row.status === "REJECTED" },
            {
              id: "remove",
              label: "Remove",
              icon: Trash2,
              onSelect: () => onRemove(row),
              hidden: !canEdit || locked || row.source !== "MANUAL" || row.status !== "PENDING",
            },
          ]}
        />
      ),
    },
  ];
}
