import { Eye, Pencil, Trash2 } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import { Badge } from "@/components/ui/Badge";
import { formatNumber } from "@/lib/format";
import type { Role } from "./types";

export interface RoleRowHandlers {
  onOpen: (role: Role) => void;
  /** True when the open action edits (rather than only views) the role. */
  canEdit: (role: Role) => boolean;
  onDelete?: (role: Role) => void;
}

export function isDeletable(role: Role): boolean {
  return !role.isSystem && role.assignmentCount === 0;
}

export function roleColumns(handlers: RoleRowHandlers): DataTableColumn<Role>[] {
  return [
    { id: "name", header: "Role", cell: (row) => <span className="font-medium text-fg">{row.name}</span> },
    { id: "key", header: "Key", cell: (row) => <span className="font-mono text-caption">{row.key}</span> },
    {
      id: "type",
      header: "Type",
      cell: (row) => <Badge tone={row.isSystem ? "primary" : "neutral"}>{row.isSystem ? "System" : "Custom"}</Badge>,
    },
    {
      id: "permissions",
      header: "Permissions",
      cell: (row) => formatNumber(row.permissions.length),
      className: "text-right",
    },
    {
      id: "assignments",
      header: "Assigned",
      cell: (row) => formatNumber(row.assignmentCount),
      className: "text-right",
    },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => {
        const editing = handlers.canEdit(row);
        return (
          <RowActions
            actions={[
              {
                id: "open",
                label: editing ? "Edit" : "View permissions",
                icon: editing ? Pencil : Eye,
                onSelect: () => handlers.onOpen(row),
              },
              {
                id: "delete",
                label: "Delete",
                icon: Trash2,
                danger: true,
                onSelect: () => handlers.onDelete?.(row),
                hidden: !handlers.onDelete || !isDeletable(row),
              },
            ]}
          />
        );
      },
    },
  ];
}
