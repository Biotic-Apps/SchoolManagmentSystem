import { useActiveChild } from "@/features/auth/use-active-child";
import { useChildToday } from "./api";
import { useMenuIds } from "./use-menu-ids";

/** Parent home: today's snapshot of the child picked in the Topbar switcher. */
export function useChildTodayPanel() {
  const child = useActiveChild();
  const menu = useMenuIds();
  const query = useChildToday(child?.id ?? null);
  const link = (id: "attendance" | "diary" | "messages" | "timetable" | "meetings") =>
    menu.has(id) ? `/${id}` : null;

  return {
    child,
    query,
    data: query.data,
    links: {
      attendance: link("attendance"),
      diary: link("diary"),
      messages: link("messages"),
      timetable: link("timetable"),
      meetings: link("meetings"),
    },
  };
}

export type ChildTodayLinks = ReturnType<typeof useChildTodayPanel>["links"];
