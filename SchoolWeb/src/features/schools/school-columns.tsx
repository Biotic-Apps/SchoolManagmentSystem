import { Archive, ArchiveRestore, Eye, Pencil, Trash2 } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate, formatNumber, textOrDash } from "@/lib/format";
import { SchoolName } from "./components/SchoolName";
import type { School } from "./types";

export interface SchoolRowHandlers {
  onView: (school: School) => void;
  onEdit?: (school: School) => void;
  onToggleStatus?: (school: School) => void;
  /** Super admin only: permanent delete. */
  onDelete?: (school: School) => void;
  canArchive: boolean;
  canActivate: boolean;
}

export function schoolColumns(handlers: SchoolRowHandlers): DataTableColumn<School>[] {
  return [
    { id: "name", header: "School", cell: (row) => <SchoolName school={row} /> },
    { id: "code", header: "Code", cell: (row) => <span className="font-mono">{row.code}</span> },
    { id: "branches", header: "Branches", cell: (row) => formatNumber(row.branchCount), className: "text-right" },
    { id: "contact", header: "Contact", cell: (row) => textOrDash(row.email ?? row.phone) },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    { id: "created", header: "Created", cell: (row) => formatDate(row.createdAt), className: "whitespace-nowrap" },
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
                id: "status",
                label: archiving ? "Archive" : "Restore",
                icon: archiving ? Archive : ArchiveRestore,
                danger: archiving,
                onSelect: () => handlers.onToggleStatus?.(row),
                hidden: archiving ? !handlers.canArchive : !handlers.canActivate,
              },
              {
                id: "delete",
                label: "Delete permanently",
                icon: Trash2,
                danger: true,
                onSelect: () => handlers.onDelete?.(row),
                hidden: !handlers.onDelete,
              },
            ]}
          />
        );
      },
    },
  ];
}
