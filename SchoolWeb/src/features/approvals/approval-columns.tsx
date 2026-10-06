import type { DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EMPTY_VALUE, formatDateTime, formatNumber, humanize } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import type { ApprovalRequest } from "./types";

export const approvalColumns: DataTableColumn<ApprovalRequest>[] = [
  { id: "title", header: "Request", cell: (row) => <span className="font-medium">{row.title}</span> },
  { id: "type", header: "Type", cell: (row) => humanize(row.type) },
  { id: "requestedBy", header: "Requested by", cell: (row) => row.requestedBy.name },
  { id: "created", header: "Created", cell: (row) => formatDateTime(row.createdAt), className: "whitespace-nowrap" },
  {
    id: "amount",
    header: "Amount",
    cell: (row) => (typeof row.amountMinor === "number" ? <MoneyText amountMinor={row.amountMinor} /> : EMPTY_VALUE),
    className: NUMERIC_COLUMN,
  },
  { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  { id: "step", header: "Step", cell: (row) => formatNumber(row.currentStep), className: NUMERIC_COLUMN },
];
