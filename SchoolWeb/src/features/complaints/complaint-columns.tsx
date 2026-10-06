import type { DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { EMPTY_VALUE, formatDate, formatDateTime } from "@/lib/format";
import { categoryLabel } from "./options";
import type { Complaint } from "./types";

export function ComplaintStatusCell({ complaint }: { complaint: Complaint }) {
  return (
    <span className="flex items-center gap-1.5">
      <StatusBadge status={complaint.status} />
      {complaint.overdue && <Badge tone="error">Overdue</Badge>}
    </span>
  );
}

export function complaintColumns(): DataTableColumn<Complaint>[] {
  return [
    {
      id: "ticket",
      header: "Ticket",
      className: "whitespace-nowrap",
      cell: (row) => <span className="font-medium tabular-nums">{row.ticketNo}</span>,
    },
    {
      id: "subject",
      header: "Subject",
      className: "min-w-48 max-w-72",
      cell: (row) => <span className="block truncate">{row.subject}</span>,
    },
    { id: "category", header: "Category", className: "whitespace-nowrap", cell: (row) => categoryLabel(row.category) },
    { id: "student", header: "Student", className: "min-w-32", cell: (row) => row.student?.name ?? EMPTY_VALUE },
    { id: "assignee", header: "Assignee", className: "min-w-32", cell: (row) => row.assignee?.name ?? EMPTY_VALUE },
    {
      id: "status",
      header: "Status",
      className: "whitespace-nowrap",
      cell: (row) => <ComplaintStatusCell complaint={row} />,
    },
    { id: "sla", header: "SLA due", className: "whitespace-nowrap", cell: (row) => formatDateTime(row.slaDueAt) },
    { id: "created", header: "Created", className: "whitespace-nowrap", cell: (row) => formatDate(row.createdAt) },
  ];
}
