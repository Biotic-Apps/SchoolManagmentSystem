import type { DataTableColumn } from "@/components/shared/DataTable";
import { EMPTY_VALUE } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import { PassBadge } from "./components/results/PassBadge";
import { formatMarks, formatPercent } from "./options";
import type { StudentResult } from "./types";

export function resultColumns(): DataTableColumn<StudentResult>[] {
  return [
    { id: "roll", header: "Roll", className: NUMERIC_COLUMN, cell: (row) => row.rollNo ?? EMPTY_VALUE },
    { id: "student", header: "Student", className: "min-w-44", cell: (row) => <span className="font-medium">{row.name}</span> },
    {
      id: "total",
      header: "Total",
      className: NUMERIC_COLUMN,
      cell: (row) => `${formatMarks(row.totalMarks)} / ${formatMarks(row.maxTotal)}`,
    },
    { id: "percent", header: "%", className: NUMERIC_COLUMN, cell: (row) => formatPercent(row.percent) },
    { id: "grade", header: "Grade", className: "whitespace-nowrap", cell: (row) => row.grade ?? EMPTY_VALUE },
    { id: "position", header: "Position", className: NUMERIC_COLUMN, cell: (row) => row.position ?? EMPTY_VALUE },
    { id: "result", header: "Result", className: "whitespace-nowrap", cell: (row) => <PassBadge passed={row.passed} /> },
  ];
}
