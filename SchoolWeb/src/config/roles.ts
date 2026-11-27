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

/** Built-in role label; custom role keys (CUSTOM_QA_NOTICES_VIEWER) read as "Qa notices viewer", not the raw key. */
export function roleLabel(role: string): string {
  if (isRoleKey(role)) return ROLE_LABELS[role];
  const text = role.replace(/^CUSTOM_/, "").replace(/[_-]+/g, " ").trim().toLowerCase();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : role;
}
