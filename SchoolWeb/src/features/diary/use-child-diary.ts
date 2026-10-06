import { useActiveChild } from "@/features/auth/use-active-child";
import { useStudent } from "@/features/students/api";
import { useWeek } from "@/features/timetable/use-week";
import { dateOfDay } from "@/features/timetable/week-dates";
import { useDiaryEntries } from "./api";
import { groupByDate } from "./options";

/** PARENT: published diary of the Topbar child, one week at a time. */
export function useChildDiary() {
  const child = useActiveChild();
  const student = useStudent(child?.id ?? null);
  const sectionId = student.data?.enrollment?.sectionId ?? null;
  const week = useWeek();
  const query = useDiaryEntries(
    { sectionId, from: week.weekOf, to: dateOfDay(week.weekOf, 7) },
    !!sectionId,
  );
  const published = (query.data ?? []).filter((entry) => entry.status === "PUBLISHED");

  return {
    child,
    student,
    sectionId,
    week,
    query,
    days: groupByDate(published),
    caption: child ? [child.name, child.className, child.sectionName].filter(Boolean).join(" · ") : undefined,
  };
}
