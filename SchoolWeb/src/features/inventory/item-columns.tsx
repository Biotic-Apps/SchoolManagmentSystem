import type { DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { Badge } from "@/components/ui/Badge";
import { minor } from "@/features/expenses/amounts";
import { EMPTY_VALUE, formatNumber } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import { itemCategoryLabel } from "./options";
import type { InventoryItem } from "./types";

function ItemFlags({ item }: { item: InventoryItem }) {
  if (!item.isAsset && !item.saleable) return <>{EMPTY_VALUE}</>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {item.isAsset && <Badge tone="primary">Asset</Badge>}
      {item.saleable && <Badge tone="info">Saleable</Badge>}
    </span>
  );
}

export function itemColumns(): DataTableColumn<InventoryItem>[] {
  return [
    { id: "sku", header: "SKU", className: "whitespace-nowrap tabular-nums", cell: (row) => row.sku },
    { id: "name", header: "Item", className: "min-w-40", cell: (row) => <span className="font-medium">{row.name}</span> },
    { id: "category", header: "Category", className: "whitespace-nowrap", cell: (row) => itemCategoryLabel(row.category) },
    { id: "unit", header: "Unit", className: "whitespace-nowrap", cell: (row) => row.unit },
    { id: "reorder", header: "Reorder level", className: NUMERIC_COLUMN, cell: (row) => formatNumber(row.reorderLevel) },
    { id: "flags", header: "Type", cell: (row) => <ItemFlags item={row} /> },
    {
      id: "price",
      header: "Sale price",
      className: NUMERIC_COLUMN,
      cell: (row) => (row.saleable ? <MoneyText amountMinor={minor(row.salePriceMinor)} /> : EMPTY_VALUE),
    },
  ];
}
