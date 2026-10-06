import type { DataTableColumn } from "@/components/shared/DataTable";
import { PersonCell } from "@/components/shared/PersonCell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EMPTY_VALUE, formatNumber } from "@/lib/format";
import { placementLabel } from "./options";
import type { StudentSummary } from "./types";

export function studentColumns(): DataTableColumn<StudentSummary>[] {
  return [
    {
      id: "name",
      header: "Student",
      cell: (row) => <PersonCell name={row.name} caption={row.admissionNo} photoUrl={row.photoUrl} />,
    },
    { id: "section", header: "Class", cell: (row) => placementLabel(row.className, row.sectionName) },
    { id: "roll", header: "Roll no", cell: (row) => formatNumber(row.rollNo), className: "text-right" },
    {
      id: "guardian",
      header: "Primary guardian",
      cell: (row) =>
        row.primaryGuardian ? (
          <span className="flex flex-col">
            <span>{row.primaryGuardian.name}</span>
            <span className="text-caption text-fg-muted">{row.primaryGuardian.phone}</span>
          </span>
        ) : (
          EMPTY_VALUE
        ),
    },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  ];
}
