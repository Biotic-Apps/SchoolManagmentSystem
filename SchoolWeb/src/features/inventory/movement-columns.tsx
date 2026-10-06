import type { DataTableColumn } from "@/components/shared/DataTable";
import { formatDateTime, formatNumber, textOrDash } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import { movementTypeLabel } from "./options";
import type { StockMovement } from "./types";
import type { ItemLookups } from "./use-item-lookups";

export function movementColumns(lookups: ItemLookups): DataTableColumn<StockMovement>[] {
  return [
    { id: "at", header: "When", className: "whitespace-nowrap", cell: (row) => formatDateTime(row.createdAt) },
    { id: "item", header: "Item", className: "min-w-40", cell: (row) => lookups.itemName(row.itemId, row.item) },
    { id: "type", header: "Type", className: "whitespace-nowrap", cell: (row) => movementTypeLabel(row.type) },
    { id: "quantity", header: "Quantity", className: NUMERIC_COLUMN, cell: (row) => formatNumber(Number(row.quantity)) },
    { id: "issuedTo", header: "Issued to", className: "min-w-32", cell: (row) => textOrDash(row.issuedTo) },
    { id: "reason", header: "Reason", className: "min-w-40", cell: (row) => textOrDash(row.reason) },
  ];
}
