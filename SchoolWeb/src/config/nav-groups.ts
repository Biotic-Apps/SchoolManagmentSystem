// Sidebar sections for long menus. Display-only: ids, labels and permissions stay in navigation.ts.
import type { NavId, NavItem } from "./navigation";

export interface NavGroup {
  id: string;
  /** Null for the ungrouped top entry (Dashboard). */
  label: string | null;
  items: NavItem[];
}

const GROUPS: { id: string; label: string | null; ids: NavId[] }[] = [
  { id: "home", label: null, ids: ["dashboard"] },
  { id: "people", label: "People", ids: ["admissions", "students", "guardians", "staff"] },
  {
    id: "academics",
    label: "Academics",
    ids: ["classes", "timetable", "attendance", "diary", "homework", "exams", "progress", "activities"],
  },
  { id: "communication", label: "Communication", ids: ["notices", "messages", "meetings", "complaints"] },
  { id: "finance", label: "Finance", ids: ["fees", "payroll", "expenses", "inventory", "accounts", "my_salary"] },
  { id: "operations", label: "Operations", ids: ["health", "pickup", "certificates", "approvals", "reports"] },
  { id: "organisation", label: "Organisation", ids: ["schools", "branches", "users", "roles", "sessions", "settings"] },
  { id: "account", label: "Account", ids: ["profile"] },
];

/** Menus at or below this length show as one flat list. */
export const GROUPED_MENU_MIN = 15;

/** Splits a role's menu into sections, dropping empty ones; unknown ids fall into the last section. */
export function groupNav(items: NavItem[]): NavGroup[] {
  const byId = new Map(items.map((entry) => [entry.id, entry]));
  const placed = new Set<NavId>();
  const groups = GROUPS.map(({ id, label, ids }) => {
    const groupItems = ids.flatMap((navId) => {
      const entry = byId.get(navId);
      if (!entry) return [];
      placed.add(navId);
      return [entry];
    });
    return { id, label, items: groupItems };
  });
  const rest = items.filter((entry) => !placed.has(entry.id));
  if (rest.length) groups[groups.length - 1].items.unshift(...rest);
  return groups.filter((group) => group.items.length > 0);
}
