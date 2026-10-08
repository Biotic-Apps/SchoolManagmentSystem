import { Pencil } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import type { Subject } from "./types";
import { countLabel } from "./text";

/** `usage` = number of classes teaching each subject (from the classes overview). */
export function subjectColumns(onEdit: ((item: Subject) => void) | undefined, usage: Map<string, number>): DataTableColumn<Subject>[] {
  return [
    { id: "name", header: "Subject", cell: (row) => <span className="font-medium">{row.name}</span> },
    { id: "code", header: "Code", cell: (row) => <span className="font-mono text-fg-muted">{row.code}</span>, className: "w-24" },
    {
      id: "usage",
      header: "Taught in",
      cell: (row) => {
        const count = usage.get(row.id) ?? 0;
        return <span className={count ? "text-fg" : "text-fg-muted"}>{count ? countLabel(count, "class", "classes") : "No class yet"}</span>;
      },
    },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => (
        <RowActions actions={[{ id: "edit", label: "Rename", icon: Pencil, onSelect: () => onEdit?.(row), hidden: !onEdit }]} />
      ),
    },
  ];
}
