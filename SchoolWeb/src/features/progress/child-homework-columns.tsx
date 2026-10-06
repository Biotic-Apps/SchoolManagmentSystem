import type { DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { EMPTY_VALUE, formatDate } from "@/lib/format";
import { homeworkStatusLabel } from "./options";
import type { ChildHomeworkRow } from "./use-child-homework";

export function childHomeworkColumns(): DataTableColumn<ChildHomeworkRow>[] {
  return [
    { id: "date", header: "Date", className: "whitespace-nowrap", cell: (row) => formatDate(row.date) },
    { id: "subject", header: "Subject", className: "min-w-32", cell: (row) => row.subject ?? EMPTY_VALUE },
    {
      id: "homework",
      header: "Homework",
      className: "min-w-64",
      cell: (row) => <span className="whitespace-pre-wrap break-words">{row.homework ?? EMPTY_VALUE}</span>,
    },
    {
      id: "status",
      header: "Status",
      className: "whitespace-nowrap",
      cell: (row) =>
        row.status ? (
          <StatusBadge status={row.status} label={homeworkStatusLabel(row.status)} />
        ) : (
          <Badge>Not checked yet</Badge>
        ),
    },
  ];
}
