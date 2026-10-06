import type { DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { formatDate, textOrDash } from "@/lib/format";
import { isDuplicate, issuedOn, requestedOn, serialOf, studentNameOf } from "./fields";
import { certificateTypeLabel } from "./options";
import type { Certificate } from "./types";

export function certificateColumns({ showStudent }: { showStudent: boolean }): DataTableColumn<Certificate>[] {
  const columns: DataTableColumn<Certificate>[] = [
    {
      id: "serial",
      header: "Serial",
      className: "whitespace-nowrap",
      cell: (row) => (
        <span className="flex items-center gap-1.5">
          <span className="font-medium tabular-nums">{serialOf(row)}</span>
          {isDuplicate(row) && <Badge tone="warning">Duplicate</Badge>}
        </span>
      ),
    },
    { id: "student", header: "Student", className: "min-w-40", cell: (row) => studentNameOf(row) },
    { id: "type", header: "Type", className: "whitespace-nowrap", cell: (row) => certificateTypeLabel(row.type) },
    {
      id: "purpose",
      header: "Purpose",
      className: "min-w-48",
      cell: (row) => <span className="break-words">{textOrDash(row.purpose)}</span>,
    },
    { id: "status", header: "Status", className: "whitespace-nowrap", cell: (row) => <StatusBadge status={row.status} /> },
    { id: "requested", header: "Requested", className: "whitespace-nowrap", cell: (row) => formatDate(requestedOn(row)) },
    { id: "issued", header: "Issued", className: "whitespace-nowrap", cell: (row) => formatDate(issuedOn(row)) },
  ];
  return showStudent ? columns : columns.filter((column) => column.id !== "student");
}
