import { Pencil } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import type { Subject } from "./types";

export function subjectColumns(onEdit?: (item: Subject) => void): DataTableColumn<Subject>[] {
  return [
    { id: "code", header: "Code", cell: (row) => <span className="font-mono">{row.code}</span>, className: "w-32" },
    { id: "name", header: "Subject", cell: (row) => <span className="font-medium">{row.name}</span> },
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
