import type { NavId } from "@/config/navigation";
import { useActiveChild } from "@/features/auth/use-active-child";
import { useParentHome } from "./api";
import { useMenuIds } from "./use-menu-ids";

const LINKED = ["attendance", "diary", "notices", "messages", "timetable", "meetings", "fees", "exams", "activities"] as const;

export type ParentLinkId = (typeof LINKED)[number];
export type ParentLinks = Record<ParentLinkId, string | null>;

/** Parent home: the dashboard of the child picked in the Topbar switcher. */
export function useParentHomePanel() {
  const child = useActiveChild();
  const menu = useMenuIds();
  const query = useParentHome(child?.id ?? null);
  const links = Object.fromEntries(
    LINKED.map((id) => [id, menu.has(id as NavId) ? `/${id}` : null]),
  ) as ParentLinks;

  return { child, query, data: query.data, links };
}
