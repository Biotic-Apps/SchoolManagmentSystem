import { Check, X } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { PersonCell } from "@/components/shared/PersonCell";
import { RowActions } from "@/components/shared/RowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { textOrDash } from "@/lib/format";
import { formatTime } from "@/lib/time";
import type { EarlyLeave } from "./types";

export function classSectionOf(student: EarlyLeave["student"]): string | null {
  return [student.className, student.sectionName].filter(Boolean).join(" ") || null;
}

interface DecisionHandlers {
  onApprove: (item: EarlyLeave) => void;
  onReject: (item: EarlyLeave) => void;
}

export function earlyLeaveColumns(decide: DecisionHandlers | null): DataTableColumn<EarlyLeave>[] {
  const columns: DataTableColumn<EarlyLeave>[] = [
    {
      id: "student",
      header: "Student",
      className: "min-w-48",
      cell: (row) => <PersonCell name={row.student.name} caption={classSectionOf(row.student)} />,
    },
    { id: "time", header: "Time", className: "whitespace-nowrap", cell: (row) => formatTime(row.time) },
    {
      id: "reason",
      header: "Reason",
      className: "min-w-48",
      cell: (row) => (
        <span className="line-clamp-2 max-w-72" title={row.reason}>
          {row.reason}
        </span>
      ),
    },
    { id: "pickup", header: "Pickup person", className: "min-w-36", cell: (row) => textOrDash(row.pickupPerson?.name) },
    { id: "requestedBy", header: "Requested by", className: "min-w-36", cell: (row) => textOrDash(row.requestedBy?.name) },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  ];
  if (!decide) return columns;
  return [
    ...columns,
    {
      id: "actions",
      header: "",
      className: "w-px",
      cell: (row) => (
        <RowActions
          label={`Actions for ${row.student.name}`}
          actions={[
            { id: "approve", label: "Approve", icon: Check, hidden: row.status !== "REQUESTED", onSelect: () => decide.onApprove(row) },
            {
              id: "reject",
              label: "Reject",
              icon: X,
              danger: true,
              hidden: row.status !== "REQUESTED",
              onSelect: () => decide.onReject(row),
            },
          ]}
        />
      ),
    },
  ];
}
