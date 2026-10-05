import { NAV_CATALOGUE, ROLE_MENUS, labelFor, navItem, type NavItem } from "@/config/navigation";
import { isRoleKey } from "@/config/roles";
import type { Session } from "@/features/auth/types";

export function can(session: Session | null | undefined, permission: string): boolean {
  return !!session && session.permissions.includes(permission);
}

// System roles use their default menu; custom roles get every permitted entry (docs/navigation.md).
function baseOrder(role: string): NavItem[] {
  return isRoleKey(role) ? ROLE_MENUS[role].map(navItem) : [...NAV_CATALOGUE];
}

export function menuFor(session: Session | null | undefined): NavItem[] {
  if (!session) return [];
  const role = session.activeRole;
  return baseOrder(role)
    .filter((entry) => can(session, entry.permission))
    .map((entry) => ({ ...entry, label: labelFor(role, entry.id) }));
}
