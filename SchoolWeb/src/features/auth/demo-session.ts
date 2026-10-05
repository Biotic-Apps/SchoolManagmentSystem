// Development-only preview of the portal shell per role. Never active in production builds.
// NEXT_PUBLIC_DEMO_ROLE accepts one role key or a comma list (first one is active), e.g. "TEACHER,PARENT".
import { ROLE_MENUS, navItem } from "@/config/navigation";
import { isRoleKey, roleLabel, type RoleKey } from "@/config/roles";
import type { Session } from "./types";

const DEMO_USER_ID = "demo";

function demoRoles(): RoleKey[] {
  if (process.env.NODE_ENV !== "development") return [];
  const raw = process.env.NEXT_PUBLIC_DEMO_ROLE ?? "";
  return raw
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter(isRoleKey);
}

export function buildDemoSession(activeRole: RoleKey, roles: RoleKey[]): Session {
  return {
    user: { id: DEMO_USER_ID, name: `Demo ${roleLabel(activeRole)}`, email: null, phone: null, mustChangePassword: false },
    roles,
    activeRole,
    permissions: ROLE_MENUS[activeRole].map((id) => navItem(id).permission),
    assignments: [],
    children: [],
  };
}

export function loadDemoSession(): Session | null {
  const roles = demoRoles();
  return roles.length ? buildDemoSession(roles[0], roles) : null;
}

export function isDemoSession(session: Session): boolean {
  return session.user.id === DEMO_USER_ID;
}
