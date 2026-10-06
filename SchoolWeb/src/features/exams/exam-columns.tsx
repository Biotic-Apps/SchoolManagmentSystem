import { Pencil } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EMPTY_VALUE } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import { examStatusLabel, examTypeLabel } from "./options";
import type { Exam } from "./types";

const EDITABLE = new Set(["DRAFT", "SCHEDULED"]);

export function examColumns(canEdit: boolean, onEdit: (exam: Exam) => void): DataTableColumn<Exam>[] {
  return [
    { id: "name", header: "Exam", className: "min-w-44", cell: (row) => <span className="font-medium">{row.name}</span> },
    { id: "type", header: "Type", className: "whitespace-nowrap", cell: (row) => examTypeLabel(row.type) },
    {
      id: "classes",
      header: "Classes",
      className: "min-w-40",
      cell: (row) => row.classes?.map((item) => item.name).join(", ") || `${row.classIds?.length ?? 0} classes`,
    },
    {
      id: "weight",
      header: "Weight",
      className: NUMERIC_COLUMN,
      cell: (row) => (row.weightPercent != null ? `${row.weightPercent}%` : EMPTY_VALUE),
    },
    {
      id: "status",
      header: "Status",
      className: "whitespace-nowrap",
      cell: (row) => <StatusBadge status={row.status} label={examStatusLabel(row.status)} />,
    },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => (
        <RowActions
          label={`Actions for ${row.name}`}
          actions={[
            { id: "edit", label: "Edit", icon: Pencil, onSelect: () => onEdit(row), hidden: !canEdit || !EDITABLE.has(row.status) },
          ]}
        />
      ),
    },
  ];
}
