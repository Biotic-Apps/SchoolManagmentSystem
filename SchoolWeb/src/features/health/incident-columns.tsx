import type { DataTableColumn } from "@/components/shared/DataTable";
import { PersonCell } from "@/components/shared/PersonCell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime, humanize, textOrDash } from "@/lib/format";
import type { IncidentDetail } from "./types";

export function classSectionOf(student: IncidentDetail["student"]): string | null {
  return [student.className, student.sectionName].filter(Boolean).join(" ") || null;
}

export function incidentColumns({ withStudent = true } = {}): DataTableColumn<IncidentDetail>[] {
  const columns: DataTableColumn<IncidentDetail>[] = [
    { id: "occurred", header: "Occurred", className: "whitespace-nowrap", cell: (row) => formatDateTime(row.occurredAt) },
    {
      id: "student",
      header: "Student",
      className: "min-w-48",
      cell: (row) => <PersonCell name={row.student.name} caption={classSectionOf(row.student)} />,
    },
    { id: "type", header: "Type", className: "whitespace-nowrap", cell: (row) => humanize(row.type) },
    { id: "severity", header: "Severity", cell: (row) => <StatusBadge status={row.severity} /> },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      id: "reportedBy",
      header: "Reported by",
      className: "min-w-36",
      cell: (row) => <span className="block max-w-48 truncate">{textOrDash(row.reportedBy?.name)}</span>,
    },
  ];
  return withStudent ? columns : columns.filter((column) => column.id !== "student");
}
