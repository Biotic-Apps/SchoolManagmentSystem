import type { DataTableColumn } from "@/components/shared/DataTable";
import { PersonCell } from "@/components/shared/PersonCell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatNumber, textOrDash } from "@/lib/format";
import { ProbationBadge } from "./components/ProbationBadge";
import { RoleBadges } from "./components/RoleBadges";
import { designationLabel } from "./options";
import type { StaffSummary } from "./types";

export function staffColumns(): DataTableColumn<StaffSummary>[] {
  return [
    {
      id: "name",
      header: "Name",
      cell: (row) => <PersonCell name={row.name} caption={row.employeeNo} photoUrl={row.photoUrl} />,
    },
    { id: "designation", header: "Designation", cell: (row) => textOrDash(designationLabel(row.designation)) },
    { id: "roles", header: "Roles", cell: (row) => <RoleBadges roles={row.roles} /> },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <span className="flex flex-wrap gap-1">
          <StatusBadge status={row.status} />
          {row.requiresReview && <ProbationBadge />}
        </span>
      ),
    },
    { id: "sections", header: "Sections", cell: (row) => formatNumber(row.sectionCount), className: "text-right" },
    { id: "subjects", header: "Subjects", cell: (row) => formatNumber(row.subjectCount), className: "text-right" },
  ];
}
