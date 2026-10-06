import type { DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EMPTY_VALUE, formatDate } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import { requestTotal } from "./purchase-amounts";
import type { PurchaseRequest } from "./types";

export function purchaseRequestColumns(): DataTableColumn<PurchaseRequest>[] {
  return [
    {
      id: "requested",
      header: "Requested on",
      className: "whitespace-nowrap",
      cell: (row) => (
        <span className="flex flex-col">
          <span className="font-medium text-fg">{formatDate(row.createdAt)}</span>
          {row.requestNo && <span className="text-caption text-fg-muted">{row.requestNo}</span>}
        </span>
      ),
    },
    { id: "lines", header: "Items", className: NUMERIC_COLUMN, cell: (row) => row.lines.length },
    {
      id: "total",
      header: "Estimated total",
      className: NUMERIC_COLUMN,
      cell: (row) => <MoneyText amountMinor={requestTotal(row)} />,
    },
    { id: "reason", header: "Reason", className: "min-w-48", cell: (row) => row.reason },
    { id: "status", header: "Status", className: "whitespace-nowrap", cell: (row) => <StatusBadge status={row.status} /> },
    {
      id: "po",
      header: "Purchase order",
      className: "whitespace-nowrap",
      cell: (row) =>
        row.purchaseOrder ? (
          <span className="flex items-center gap-1.5">
            <span className="tabular-nums">{row.purchaseOrder.poNo}</span>
            <StatusBadge status={row.purchaseOrder.status} />
          </span>
        ) : (
          EMPTY_VALUE
        ),
    },
  ];
}
