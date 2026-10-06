import { labelFor } from "@/config/navigation";
import { useActiveChild } from "@/features/auth/use-active-child";
import { useMyWeek } from "./use-my-week";

export function useChildTimetable() {
  const child = useActiveChild();
  const mine = useMyWeek(child?.id ?? null, !!child);
  const classLine = child ? [child.className, child.sectionName].filter(Boolean).join(" ") : "";
  return {
    ...mine,
    child,
    title: labelFor("PARENT", "timetable"),
    description: child ? `${child.name}${classLine ? ` · ${classLine}` : ""}` : undefined,
  };
}
