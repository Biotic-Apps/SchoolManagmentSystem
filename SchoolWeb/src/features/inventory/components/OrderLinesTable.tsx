import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { minor } from "@/features/expenses/amounts";
import { formatNumber } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import { receivedOf } from "../purchase-amounts";
import type { PurchaseOrderLine } from "../types";
import type { ItemLookups } from "../use-item-lookups";

function columns(lookups: ItemLookups): DataTableColumn<PurchaseOrderLine>[] {
  return [
    { id: "item", header: "Item", className: "min-w-36", cell: (row) => lookups.itemName(row.itemId, row.item) },
    { id: "ordered", header: "Ordered", className: NUMERIC_COLUMN, cell: (row) => formatNumber(Number(row.quantity)) },
    { id: "received", header: "Received", className: NUMERIC_COLUMN, cell: (row) => formatNumber(receivedOf(row)) },
    {
      id: "unit",
      header: "Unit price",
      className: NUMERIC_COLUMN,
      cell: (row) => <MoneyText amountMinor={minor(row.unitPriceMinor)} />,
    },
    {
      id: "total",
      header: "Total",
      className: NUMERIC_COLUMN,
      cell: (row) => <MoneyText amountMinor={Number(row.quantity) * (minor(row.unitPriceMinor) ?? 0)} />,
    },
  ];
}

export function OrderLinesTable({ lines, lookups }: { lines: PurchaseOrderLine[]; lookups: ItemLookups }) {
  return <DataTable columns={columns(lookups)} rows={lines} getRowId={(row) => row.itemId} emptyTitle="No items" />;
}
