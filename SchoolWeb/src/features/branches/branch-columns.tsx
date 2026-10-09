import { Archive, ArchiveRestore, Clock, Eye, Pencil, Settings, UserCog } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { weekdayLabels } from "@/components/shared/WeekdayPicker";
import { EMPTY_VALUE } from "@/lib/format";
import { formatTimeRange } from "@/lib/time";
import type { Branch } from "./types";

export interface BranchRowHandlers {
  onView: (branch: Branch) => void;
  onEdit?: (branch: Branch) => void;
  onEditTimings?: (branch: Branch) => void;
  onToggleStatus: (branch: Branch) => void;
  onChangePrincipal?: (branch: Branch) => void;
  onSettings?: (branch: Branch) => void;
  canArchive: boolean;
  canActivate: boolean;
}

function timingsCell(branch: Branch) {
  const t = branch.timings;
  return (
    <span className="flex flex-col">
      <span>{formatTimeRange(t?.opensAt, t?.closesAt)}</span>
      {t && (
        <span className="text-caption text-fg-muted">Teachers {formatTimeRange(t.staffArrivesAt, t.staffLeavesAt)}</span>
      )}
    </span>
  );
}

export function branchColumns(handlers: BranchRowHandlers, showSchool: boolean): DataTableColumn<Branch>[] {
  const columns: (DataTableColumn<Branch> | false)[] = [
    {
      id: "name",
      header: "Branch",
      cell: (row) => (
        <span className="flex flex-col">
          <span className="font-medium">{row.name}</span>
          <span className="font-mono text-caption text-fg-muted">{row.code}</span>
        </span>
      ),
    },
    showSchool && { id: "school", header: "School", cell: (row) => row.schoolName },
    { id: "principal", header: "Principal", cell: (row) => row.principal?.name ?? EMPTY_VALUE },
    { id: "timings", header: "Timings", cell: timingsCell, className: "whitespace-nowrap" },
    { id: "days", header: "Working days", cell: (row) => weekdayLabels(row.workingDays) || EMPTY_VALUE },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => {
        const archiving = row.status === "ACTIVE";
        return (
          <RowActions
            actions={[
              { id: "view", label: "View details", icon: Eye, onSelect: () => handlers.onView(row) },
              { id: "edit", label: "Edit", icon: Pencil, onSelect: () => handlers.onEdit?.(row), hidden: !handlers.onEdit },
              {
                id: "timings",
                label: "Edit timings",
                icon: Clock,
                onSelect: () => handlers.onEditTimings?.(row),
                hidden: !handlers.onEditTimings,
              },
              {
                id: "principal",
                label: "Change principal",
                icon: UserCog,
                onSelect: () => handlers.onChangePrincipal?.(row),
                hidden: !handlers.onChangePrincipal,
              },
              {
                id: "settings",
                label: "Branch settings",
                icon: Settings,
                onSelect: () => handlers.onSettings?.(row),
                hidden: !handlers.onSettings,
              },
              {
                id: "status",
                label: archiving ? "Archive" : "Activate",
                icon: archiving ? Archive : ArchiveRestore,
                danger: archiving,
                onSelect: () => handlers.onToggleStatus(row),
                hidden: archiving ? !handlers.canArchive : !handlers.canActivate,
              },
            ]}
          />
        );
      },
    },
  ];
  return columns.filter((column): column is DataTableColumn<Branch> => !!column);
}
