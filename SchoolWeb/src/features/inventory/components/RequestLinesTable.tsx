import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { minor } from "@/features/expenses/amounts";
import { formatNumber } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import type { PurchaseRequestLine } from "../types";
import type { ItemLookups } from "../use-item-lookups";

function columns(lookups: ItemLookups): DataTableColumn<PurchaseRequestLine>[] {
  return [
    { id: "item", header: "Item", className: "min-w-36", cell: (row) => lookups.itemName(row.itemId, row.item) },
    { id: "quantity", header: "Quantity", className: NUMERIC_COLUMN, cell: (row) => formatNumber(Number(row.quantity)) },
    {
      id: "unit",
      header: "Unit price (est.)",
      className: NUMERIC_COLUMN,
      cell: (row) => <MoneyText amountMinor={minor(row.estimatedUnitMinor)} />,
    },
    {
      id: "total",
      header: "Total",
      className: NUMERIC_COLUMN,
      cell: (row) => <MoneyText amountMinor={Number(row.quantity) * (minor(row.estimatedUnitMinor) ?? 0)} />,
    },
  ];
}

export function RequestLinesTable({ lines, lookups }: { lines: PurchaseRequestLine[]; lookups: ItemLookups }) {
  return (
    <DataTable
      columns={columns(lookups)}
      rows={lines}
      getRowId={(row) => row.itemId}
      emptyTitle="No items"
    />
  );
}
