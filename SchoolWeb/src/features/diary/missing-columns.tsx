import type { DataTableColumn } from "@/components/shared/DataTable";
import { PersonCell } from "@/components/shared/PersonCell";
import { EMPTY_VALUE } from "@/lib/format";
import type { MissingDiary } from "./types";

export const missingKey = (row: MissingDiary) => `${row.sectionId}:${row.subject?.id ?? row.subjectId ?? ""}`;

export function missingColumns(): DataTableColumn<MissingDiary>[] {
  return [
    {
      id: "section",
      header: "Class & section",
      className: "whitespace-nowrap",
      cell: (row) => <span className="font-medium">{`${row.className} ${row.sectionName}`}</span>,
    },
    {
      id: "subject",
      header: "Subject",
      className: "whitespace-nowrap",
      cell: (row) => row.subject?.name ?? row.subjectName ?? EMPTY_VALUE,
    },
    {
      id: "teacher",
      header: "Teacher",
      className: "min-w-48",
      cell: (row) => (row.teacher ? <PersonCell name={row.teacher.name} /> : EMPTY_VALUE),
    },
  ];
}
