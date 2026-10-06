import { CircleSlash } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import { Badge } from "@/components/ui/Badge";
import { EMPTY_VALUE, formatDate, humanize, textOrDash } from "@/lib/format";
import type { StaffAssignment } from "./types";

function sectionLabel(row: StaffAssignment): string {
  if (!row.sectionId) return "Whole branch";
  return [row.className, row.sectionName].filter(Boolean).join(" ") || EMPTY_VALUE;
}

export function assignmentColumns(onEnd?: (row: StaffAssignment) => void): DataTableColumn<StaffAssignment>[] {
  return [
    { id: "kind", header: "Assignment", cell: (row) => <span className="font-medium">{humanize(row.kind)}</span> },
    { id: "section", header: "Class section", cell: sectionLabel },
    { id: "subject", header: "Subject", cell: (row) => textOrDash(row.subjectName) },
    { id: "responsible", header: "Responsible teacher", cell: (row) => textOrDash(row.responsibleStaff?.name) },
    {
      id: "substitute",
      header: "Substitute",
      cell: (row) =>
        row.isSubstitute ? (
          <Badge tone="info">{row.validUntil ? `Until ${formatDate(row.validUntil)}` : "Substitute"}</Badge>
        ) : (
          EMPTY_VALUE
        ),
    },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => (
        <RowActions
          actions={[
            {
              id: "end",
              label: "End assignment",
              icon: CircleSlash,
              danger: true,
              onSelect: () => onEnd?.(row),
              hidden: !onEnd,
            },
          ]}
        />
      ),
    },
  ];
}
