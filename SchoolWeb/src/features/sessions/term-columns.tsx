import { Pencil, Trash2 } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import { formatDateRange } from "@/lib/format";
import type { Term } from "./types";

export interface TermRowHandlers {
  onEdit?: (term: Term) => void;
  onDelete?: (term: Term) => void;
}

export function termColumns(handlers: TermRowHandlers): DataTableColumn<Term>[] {
  return [
    { id: "name", header: "Term", cell: (row) => <span className="font-medium text-fg">{row.name}</span> },
    { id: "dates", header: "Dates", cell: (row) => formatDateRange(row.startDate, row.endDate) },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => (
        <RowActions
          actions={[
            { id: "edit", label: "Edit", icon: Pencil, onSelect: () => handlers.onEdit?.(row), hidden: !handlers.onEdit },
            {
              id: "delete",
              label: "Delete",
              icon: Trash2,
              danger: true,
              onSelect: () => handlers.onDelete?.(row),
              hidden: !handlers.onDelete,
            },
          ]}
        />
      ),
    },
  ];
}
