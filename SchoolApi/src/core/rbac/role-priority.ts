import { RoleKey } from './role-key.enum';

/** Default active-role order; custom roles follow alphabetically. */
export const ROLE_PRIORITY: readonly string[] = [
  RoleKey.SUPER_ADMIN,
  RoleKey.PRINCIPAL,
  RoleKey.COORDINATOR,
  RoleKey.HEAD_TEACHER,
  RoleKey.ACCOUNTANT,
  RoleKey.TEACHER,
  RoleKey.HELPER,
  RoleKey.PARENT,
];

function rank(key: string): number {
  const index = ROLE_PRIORITY.indexOf(key);
  return index === -1 ? ROLE_PRIORITY.length : index;
}

export function sortRoleKeys(keys: Iterable<string>): string[] {
  return [...new Set(keys)].sort(
    (a, b) => rank(a) - rank(b) || a.localeCompare(b),
  );
}
