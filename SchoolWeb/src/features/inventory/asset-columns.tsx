import type { DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { textOrDash } from "@/lib/format";
import type { Asset } from "./types";
import type { ItemLookups } from "./use-item-lookups";

export function assetColumns(lookups: ItemLookups): DataTableColumn<Asset>[] {
  return [
    {
      id: "tag",
      header: "Tag",
      className: "whitespace-nowrap tabular-nums",
      cell: (row) => <span className="font-medium">{row.tag}</span>,
    },
    { id: "item", header: "Item", className: "min-w-40", cell: (row) => lookups.itemName(row.itemId, row.item) },
    { id: "location", header: "Location", className: "min-w-32", cell: (row) => row.location },
    {
      id: "condition",
      header: "Condition",
      className: "whitespace-nowrap",
      cell: (row) => <StatusBadge status={row.condition} />,
    },
    { id: "assignedTo", header: "Assigned to", className: "min-w-32", cell: (row) => textOrDash(row.assignedTo) },
  ];
}
