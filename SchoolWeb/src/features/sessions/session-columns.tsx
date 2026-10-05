import { CirclePlay, ListOrdered, Lock, Pencil } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateRange, formatNumber } from "@/lib/format";
import type { AcademicSession } from "./types";

export type SessionTransition = "activate" | "close";

export interface SessionRowHandlers {
  onTerms: (session: AcademicSession) => void;
  onEdit?: (session: AcademicSession) => void;
  onTransition?: (session: AcademicSession, action: SessionTransition) => void;
}

export function sessionColumns(handlers: SessionRowHandlers): DataTableColumn<AcademicSession>[] {
  return [
    { id: "name", header: "Session", cell: (row) => <span className="font-medium text-fg">{row.name}</span> },
    {
      id: "dates",
      header: "Dates",
      cell: (row) => formatDateRange(row.startDate, row.endDate),
      className: "whitespace-nowrap",
    },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    { id: "terms", header: "Terms", cell: (row) => formatNumber(row.termCount), className: "text-right" },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => {
        const open = row.status !== "CLOSED";
        return (
          <RowActions
            actions={[
              { id: "terms", label: open ? "Manage terms" : "View terms", icon: ListOrdered, onSelect: () => handlers.onTerms(row) },
              { id: "edit", label: "Edit", icon: Pencil, onSelect: () => handlers.onEdit?.(row), hidden: !handlers.onEdit || !open },
              {
                id: "activate",
                label: "Activate",
                icon: CirclePlay,
                onSelect: () => handlers.onTransition?.(row, "activate"),
                hidden: !handlers.onTransition || row.status !== "DRAFT",
              },
              {
                id: "close",
                label: "Close session",
                icon: Lock,
                danger: true,
                onSelect: () => handlers.onTransition?.(row, "close"),
                hidden: !handlers.onTransition || row.status !== "ACTIVE",
              },
            ]}
          />
        );
      },
    },
  ];
}
