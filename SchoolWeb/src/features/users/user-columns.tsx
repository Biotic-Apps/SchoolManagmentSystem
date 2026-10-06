import { Eye, KeyRound, LockOpen, Pencil, UserCheck, UserX } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { roleLabel } from "@/config/roles";
import { EMPTY_VALUE, formatDateTime } from "@/lib/format";
import type { UserSummary } from "./types";

export interface UserRowHandlers {
  onView: (user: UserSummary) => void;
  onEdit?: (user: UserSummary) => void;
  onToggleStatus?: (user: UserSummary) => void;
  onResetPassword?: (user: UserSummary) => void;
  onUnlock?: (user: UserSummary) => void;
  currentUserId: string | null;
}

// Older APIs do not report the lock, so the action stays available there.
function mayBeLocked(user: UserSummary): boolean {
  if (user.lockedUntil === undefined) return true;
  return !!user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now();
}

export function userColumns(handlers: UserRowHandlers): DataTableColumn<UserSummary>[] {
  return [
    {
      id: "name",
      header: "Name",
      cell: (row) => (
        <span className="flex flex-col">
          <span className="font-medium">{row.name}</span>
          <span className="text-caption text-fg-muted">{row.email ?? row.phone ?? EMPTY_VALUE}</span>
        </span>
      ),
    },
    {
      id: "roles",
      header: "Roles",
      cell: (row) => (
        <span className="flex flex-wrap gap-1">
          {row.roles.map((role) => (
            <Badge key={role} tone="primary">
              {roleLabel(role)}
            </Badge>
          ))}
        </span>
      ),
    },
    { id: "branches", header: "Branches", cell: (row) => row.branchNames.join(", ") || EMPTY_VALUE },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <span className="flex flex-wrap gap-1">
          <StatusBadge status={row.status} />
          {row.lockedUntil && mayBeLocked(row) && <StatusBadge status="LOCKED" label="Locked" />}
        </span>
      ),
    },
    { id: "login", header: "Last sign-in", cell: (row) => formatDateTime(row.lastLoginAt), className: "whitespace-nowrap" },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => {
        const isSelf = row.id === handlers.currentUserId;
        const disabling = row.status === "ACTIVE";
        return (
          <RowActions
            actions={[
              { id: "view", label: "View details", icon: Eye, onSelect: () => handlers.onView(row) },
              { id: "edit", label: "Edit", icon: Pencil, onSelect: () => handlers.onEdit?.(row), hidden: !handlers.onEdit },
              {
                id: "reset",
                label: "Reset password",
                icon: KeyRound,
                onSelect: () => handlers.onResetPassword?.(row),
                hidden: !handlers.onResetPassword || isSelf,
              },
              {
                id: "unlock",
                label: "Unlock account",
                icon: LockOpen,
                onSelect: () => handlers.onUnlock?.(row),
                hidden: !handlers.onUnlock || isSelf || !mayBeLocked(row),
              },
              {
                id: "status",
                label: disabling ? "Disable" : "Enable",
                icon: disabling ? UserX : UserCheck,
                danger: disabling,
                onSelect: () => handlers.onToggleStatus?.(row),
                hidden: !handlers.onToggleStatus || isSelf,
              },
            ]}
          />
        );
      },
    },
  ];
}
