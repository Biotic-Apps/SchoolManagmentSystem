import { CheckCircle2, Pencil } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { NUMERIC_COLUMN } from "@/lib/table";
import type { GradingScheme } from "./types";

interface GradingColumnActions {
  canEdit: boolean;
  canApprove: boolean;
  isLocked: (scheme: GradingScheme) => boolean;
  onEdit: (scheme: GradingScheme) => void;
  onApprove: (scheme: GradingScheme) => void;
}

function bandSummary(scheme: GradingScheme): string {
  return [...scheme.bands]
    .sort((a, b) => Number(b.minPercent) - Number(a.minPercent))
    .map((band) => `${band.grade} ${band.minPercent}–${band.maxPercent}`)
    .join(", ");
}

export function gradingColumns(actions: GradingColumnActions): DataTableColumn<GradingScheme>[] {
  return [
    { id: "name", header: "Name", className: "min-w-40", cell: (row) => <span className="font-medium">{row.name}</span> },
    { id: "pass", header: "Pass %", className: NUMERIC_COLUMN, cell: (row) => `${row.passPercent}%` },
    { id: "bands", header: "Bands", className: "min-w-64", cell: (row) => <span className="text-fg-muted">{bandSummary(row)}</span> },
    {
      id: "status",
      header: "Status",
      className: "whitespace-nowrap",
      cell: (row) => (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge status={row.status ?? "DRAFT"} />
          {actions.isLocked(row) && (
            <span className="text-caption text-fg-muted">Locked: used by an exam with approved results</span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => (
        <RowActions
          label={`Actions for ${row.name}`}
          actions={[
            {
              id: "edit",
              label: "Edit",
              icon: Pencil,
              onSelect: () => actions.onEdit(row),
              hidden: !actions.canEdit || actions.isLocked(row),
            },
            {
              id: "approve",
              label: "Approve",
              icon: CheckCircle2,
              onSelect: () => actions.onApprove(row),
              hidden: !actions.canApprove || row.status === "APPROVED",
            },
          ]}
        />
      ),
    },
  ];
}
