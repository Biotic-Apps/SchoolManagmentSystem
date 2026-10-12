import type { DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { ExamPaper } from "./types";

export function examPaperColumns(): DataTableColumn<ExamPaper>[] {
  return [
    {
      id: "title",
      header: "Title",
      className: "min-w-52 max-w-xs",
      cell: (row) => <span className="block truncate font-medium">{row.title}</span>,
    },
    {
      id: "subject",
      header: "Subject",
      className: "whitespace-nowrap",
      cell: (row) => row.subject?.name ?? "-",
    },
    {
      id: "class",
      header: "Class",
      className: "whitespace-nowrap",
      cell: (row) => row.class?.name ?? "-",
    },
    {
      id: "totalMarks",
      header: "Total Marks",
      className: "whitespace-nowrap text-center",
      cell: (row) => String(row.totalMarks),
    },
    {
      id: "duration",
      header: "Duration",
      className: "whitespace-nowrap",
      cell: (row) => `${row.duration} min`,
    },
    {
      id: "sections",
      header: "Sections",
      className: "whitespace-nowrap text-center",
      cell: (row) => String(row.sections.length),
    },
    {
      id: "status",
      header: "Status",
      className: "whitespace-nowrap",
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];
}
