import { Archive, Pencil } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatNumber, textOrDash } from "@/lib/format";
import type { Section } from "./types";

interface SectionRowHandlers {
  onEdit?: (item: Section) => void;
  onArchive?: (item: Section) => void;
}

export function sectionColumns({ onEdit, onArchive }: SectionRowHandlers): DataTableColumn<Section>[] {
  return [
    { id: "class", header: "Class", cell: (row) => row.className },
    { id: "name", header: "Section", cell: (row) => <span className="font-medium">{row.name}</span> },
    { id: "capacity", header: "Capacity", cell: (row) => formatNumber(row.capacity), className: "text-right" },
    { id: "students", header: "Students", cell: (row) => formatNumber(row.studentCount), className: "text-right" },
    { id: "room", header: "Room", cell: (row) => textOrDash(row.room?.name) },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => {
        const archived = row.status === "ARCHIVED";
        return (
          <RowActions
            actions={[
              { id: "edit", label: "Edit", icon: Pencil, onSelect: () => onEdit?.(row), hidden: !onEdit || archived },
              {
                id: "archive",
                label: "Archive",
                icon: Archive,
                danger: true,
                onSelect: () => onArchive?.(row),
                hidden: !onArchive || archived,
              },
            ]}
          />
        );
      },
    },
  ];
}
