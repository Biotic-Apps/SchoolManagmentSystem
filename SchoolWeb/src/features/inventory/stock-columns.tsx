import type { DataTableColumn } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/Badge";
import { EMPTY_VALUE, formatNumber } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import { itemCategoryLabel } from "./options";
import type { StockLine } from "./stock-rows";

export function stockColumns(): DataTableColumn<StockLine>[] {
  return [
    {
      id: "item",
      header: "Item",
      className: "min-w-44",
      cell: (row) => (
        <span className="flex flex-col">
          <span className="font-medium text-fg">{row.name || EMPTY_VALUE}</span>
          {row.sku && <span className="text-caption text-fg-muted">{row.sku}</span>}
        </span>
      ),
    },
    {
      id: "category",
      header: "Category",
      className: "whitespace-nowrap",
      cell: (row) => itemCategoryLabel(row.category) || EMPTY_VALUE,
    },
    {
      id: "quantity",
      header: "Quantity",
      className: NUMERIC_COLUMN,
      cell: (row) => (
        <span className="font-medium">
          {formatNumber(row.quantity)}
          {row.unit && <span className="ml-1 text-caption font-normal text-fg-muted">{row.unit}</span>}
        </span>
      ),
    },
    { id: "reorder", header: "Reorder level", className: NUMERIC_COLUMN, cell: (row) => formatNumber(row.reorderLevel) },
    {
      id: "alert",
      header: "Alert",
      className: "whitespace-nowrap",
      cell: (row) => (row.low ? <Badge tone="warning">Low stock</Badge> : EMPTY_VALUE),
    },
  ];
}
