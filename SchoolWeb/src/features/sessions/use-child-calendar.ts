import { useActiveChild } from "@/features/auth/use-active-child";
import { useStudentCalendar } from "./api";
import { eventColumns } from "./event-columns";

const columns = eventColumns({}).filter((column) => column.id !== "actions");

/** PARENT: upcoming school calendar of the Topbar child's branch. */
export function useChildCalendar() {
  const child = useActiveChild();
  const query = useStudentCalendar(child?.id ?? null);
  const events = [...(query.data ?? [])].sort((a, b) => a.startDate.localeCompare(b.startDate));
  return { child, query, events, columns };
}
