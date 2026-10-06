import { Trash2 } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import { textOrDash } from "@/lib/format";
import type { TimetableOverride } from "./types";

export interface OverrideLookups {
  sectionName: (row: TimetableOverride) => string;
  periodLabel: (periodIndex: number) => string;
  staffName: (id: string | undefined) => string | null;
}

export function overrideColumns(lookups: OverrideLookups, onDelete?: (row: TimetableOverride) => void): DataTableColumn<TimetableOverride>[] {
  return [
    { id: "section", header: "Class", cell: (row) => <span className="font-medium">{lookups.sectionName(row)}</span> },
    { id: "period", header: "Period", cell: (row) => lookups.periodLabel(row.periodIndex) },
    {
      id: "substitute",
      header: "Substitute",
      cell: (row) => textOrDash(row.substituteStaff?.name ?? lookups.staffName(row.substituteStaffId)),
    },
    { id: "original", header: "Original teacher", cell: (row) => textOrDash(row.originalStaff?.name) },
    { id: "reason", header: "Reason", cell: (row) => textOrDash(row.reason) },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => (
        <RowActions
          actions={[
            { id: "delete", label: "Remove", icon: Trash2, danger: true, onSelect: () => onDelete?.(row), hidden: !onDelete },
          ]}
        />
      ),
    },
  ];
}
