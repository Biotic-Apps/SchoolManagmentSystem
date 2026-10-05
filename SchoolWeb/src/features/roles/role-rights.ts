import type { RoleEditRights } from "./schemas";
import type { Role } from "./types";

/** System roles: name/key fixed, permissions editable by SUPER_ADMIN only. */
export function roleEditRights(role: Role | null, canEdit: boolean, activeRole: string | undefined): RoleEditRights {
  if (!role) return { name: true, permissions: true };
  if (!canEdit) return { name: false, permissions: false };
  if (!role.isSystem) return { name: true, permissions: true };
  return { name: false, permissions: activeRole === "SUPER_ADMIN" };
}

export function roleReadOnlyNotice(role: Role | null, rights: RoleEditRights, canEdit: boolean): string | null {
  if (!role || rights.permissions) return null;
  if (!canEdit) return "You can view this role but not change it.";
  return "Only a Super Admin can change the permissions of a system role.";
}
