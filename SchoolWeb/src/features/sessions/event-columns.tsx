import { Pencil, Trash2 } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import { formatDateRange } from "@/lib/format";
import { EventTypeBadge } from "./components/EventTypeBadge";
import type { CalendarEvent } from "./types";

export interface EventRowHandlers {
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
}

export function eventScopeLabel(event: CalendarEvent): string {
  return event.branchId ? "This branch" : "Whole school";
}

export function eventColumns(handlers: EventRowHandlers): DataTableColumn<CalendarEvent>[] {
  return [
    { id: "title", header: "Title", cell: (row) => <span className="font-medium text-fg">{row.title}</span> },
    { id: "type", header: "Type", cell: (row) => <EventTypeBadge type={row.type} /> },
    {
      id: "dates",
      header: "Dates",
      cell: (row) => formatDateRange(row.startDate, row.endDate),
      className: "whitespace-nowrap",
    },
    { id: "scope", header: "Applies to", cell: eventScopeLabel },
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
