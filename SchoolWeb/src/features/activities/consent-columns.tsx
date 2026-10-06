import type { DataTableColumn } from "@/components/shared/DataTable";
import { PersonCell } from "@/components/shared/PersonCell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EMPTY_VALUE, formatDateTime } from "@/lib/format";
import type { ConsentRow } from "./types";

export const CONSENT_COLUMNS: DataTableColumn<ConsentRow>[] = [
  {
    id: "student",
    header: "Student",
    className: "min-w-44",
    cell: (row) => (
      <PersonCell
        name={row.student.name}
        caption={[row.student.className, row.student.sectionName].filter(Boolean).join(" ") || null}
      />
    ),
  },
  { id: "guardian", header: "Guardian", className: "min-w-32", cell: (row) => row.guardian?.name ?? EMPTY_VALUE },
  { id: "status", header: "Status", className: "whitespace-nowrap", cell: (row) => <StatusBadge status={row.status} /> },
  {
    id: "responded",
    header: "Responded",
    className: "whitespace-nowrap",
    cell: (row) => (row.respondedAt ? formatDateTime(row.respondedAt) : EMPTY_VALUE),
  },
];
