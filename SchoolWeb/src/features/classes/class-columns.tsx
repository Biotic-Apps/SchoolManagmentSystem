import { BookOpen, Pencil } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import { formatNumber } from "@/lib/format";
import type { SchoolClass } from "./types";

interface ClassRowHandlers {
  onEdit?: (item: SchoolClass) => void;
  onSubjects?: (item: SchoolClass) => void;
}

export function classColumns({ onEdit, onSubjects }: ClassRowHandlers): DataTableColumn<SchoolClass>[] {
  return [
    { id: "name", header: "Class", cell: (row) => <span className="font-medium">{row.name}</span> },
    { id: "level", header: "Level order", cell: (row) => formatNumber(row.levelOrder), className: "text-right" },
    { id: "subjects", header: "Subjects", cell: (row) => formatNumber(row.subjectCount), className: "text-right" },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => (
        <RowActions
          actions={[
            { id: "edit", label: "Edit", icon: Pencil, onSelect: () => onEdit?.(row), hidden: !onEdit },
            { id: "subjects", label: "Subjects", icon: BookOpen, onSelect: () => onSubjects?.(row), hidden: !onSubjects },
          ]}
        />
      ),
    },
  ];
}
