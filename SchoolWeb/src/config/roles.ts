export const ROLE_KEYS = [
  "SUPER_ADMIN",
  "PRINCIPAL",
  "COORDINATOR",
  "HEAD_TEACHER",
  "TEACHER",
  "HELPER",
  "ACCOUNTANT",
  "PARENT",
] as const;

export type RoleKey = (typeof ROLE_KEYS)[number];

export const ROLE_LABELS: Record<RoleKey, string> = {
  SUPER_ADMIN: "Super Admin",
  PRINCIPAL: "Principal",
  COORDINATOR: "Coordinator",
  HEAD_TEACHER: "Head Teacher",
  TEACHER: "Teacher",
  HELPER: "Helper",
  ACCOUNTANT: "Accountant",
  PARENT: "Parent",
};

export function isRoleKey(value: string): value is RoleKey {
  return (ROLE_KEYS as readonly string[]).includes(value);
}

export function roleLabel(role: string): string {
  return isRoleKey(role) ? ROLE_LABELS[role] : role;
}
