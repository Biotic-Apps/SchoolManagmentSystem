import type { DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate, formatNumber, textOrDash } from "@/lib/format";
import { placementLabel } from "./options";
import type { Enrollment } from "./types";

export const enrollmentColumns: DataTableColumn<Enrollment>[] = [
  { id: "session", header: "Session", cell: (row) => row.sessionName },
  { id: "branch", header: "Branch", cell: (row) => row.branchName },
  { id: "section", header: "Class", cell: (row) => placementLabel(row.className, row.sectionName) },
  { id: "roll", header: "Roll no", cell: (row) => formatNumber(row.rollNo), className: "text-right" },
  {
    id: "dates",
    header: "Dates",
    cell: (row) => `${formatDate(row.startDate)} – ${row.endDate ? formatDate(row.endDate) : "present"}`,
    className: "whitespace-nowrap",
  },
  { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  { id: "reason", header: "Reason", cell: (row) => textOrDash(row.reason) },
];
