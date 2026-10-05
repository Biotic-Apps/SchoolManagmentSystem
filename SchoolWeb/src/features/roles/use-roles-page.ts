import { useMemo, useState } from "react";
import { useSession } from "@/features/auth/session-context";
import { useCan } from "@/features/auth/use-can";
import { useDialogState } from "@/lib/use-dialog-state";
import { useRoles } from "./api";
import { roleColumns } from "./role-columns";
import { roleEditRights } from "./role-rights";
import type { Role } from "./types";

function matches(role: Role, search: string): boolean {
  const term = search.trim().toLowerCase();
  return !term || role.name.toLowerCase().includes(term) || role.key.toLowerCase().includes(term);
}

export function useRolesPage() {
  const can = useCan();
  const { session } = useSession();
  const query = useRoles();
  const [search, setSearch] = useState("");
  const form = useDialogState<Role>();
  const deleteTarget = useDialogState<Role>();

  const canEdit = can("roles.edit");
  const canDelete = can("roles.delete");
  const activeRole = session?.activeRole;

  const columns = useMemo(
    () =>
      roleColumns({
        onOpen: form.show,
        canEdit: (role) => roleEditRights(role, canEdit, activeRole).permissions,
        onDelete: canDelete ? deleteTarget.show : undefined,
      }),
    [form.show, deleteTarget.show, canEdit, canDelete, activeRole],
  );

  const rows = useMemo(() => query.data?.filter((role) => matches(role, search)), [query.data, search]);

  return { query, rows, columns, search, setSearch, canAdd: can("roles.add"), form, deleteTarget };
}
