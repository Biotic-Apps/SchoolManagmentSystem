import type { DataTableColumn } from "@/components/shared/DataTable";
import type { Assignment } from "@/features/auth/types";
import { formatDate } from "@/lib/format";

function scopeLabel(assignment: Assignment): string {
  if (assignment.scopeType === "GLOBAL") return "All schools";
  const parts = [assignment.schoolName, assignment.branchName].filter(Boolean);
  return parts.length > 0 ? parts.join(" › ") : "Own records";
}

export const roleColumns: DataTableColumn<Assignment>[] = [
  { id: "role", header: "Role", cell: (row) => <span className="font-medium">{row.roleName}</span> },
  { id: "scope", header: "Scope", cell: scopeLabel },
  {
    id: "validUntil",
    header: "Valid until",
    cell: (row) => (row.validUntil ? formatDate(row.validUntil) : "No end date"),
    className: "whitespace-nowrap",
  },
];
