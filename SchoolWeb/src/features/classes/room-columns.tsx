import { Pencil } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import { formatNumber } from "@/lib/format";
import type { Room } from "./types";

export function roomColumns(onEdit?: (item: Room) => void): DataTableColumn<Room>[] {
  return [
    { id: "name", header: "Room", cell: (row) => <span className="font-medium">{row.name}</span> },
    { id: "capacity", header: "Capacity", cell: (row) => formatNumber(row.capacity), className: "text-right" },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => (
        <RowActions actions={[{ id: "edit", label: "Edit", icon: Pencil, onSelect: () => onEdit?.(row), hidden: !onEdit }]} />
      ),
    },
  ];
}
