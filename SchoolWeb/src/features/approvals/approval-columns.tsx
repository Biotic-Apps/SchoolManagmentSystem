import type { DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime, formatNumber, humanize } from "@/lib/format";
import type { ApprovalRequest } from "./types";

export const approvalColumns: DataTableColumn<ApprovalRequest>[] = [
  { id: "title", header: "Request", cell: (row) => <span className="font-medium">{row.title}</span> },
  { id: "type", header: "Type", cell: (row) => humanize(row.type) },
  { id: "requestedBy", header: "Requested by", cell: (row) => row.requestedBy.name },
  { id: "created", header: "Created", cell: (row) => formatDateTime(row.createdAt), className: "whitespace-nowrap" },
  { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  { id: "step", header: "Step", cell: (row) => formatNumber(row.currentStep), className: "text-right" },
];
