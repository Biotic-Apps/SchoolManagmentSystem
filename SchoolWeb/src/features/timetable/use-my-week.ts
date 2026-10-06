import { useMemo } from "react";
import { useMyTimetable } from "./api";
import { teacherWeek } from "./grid";
import { useWeek } from "./use-week";

/** Own week (teacher/helper) or, with a studentId, the parent's child's week. */
export function useMyWeek(studentId: string | null = null, enabled = true) {
  const week = useWeek();
  const query = useMyTimetable(week.weekOf, studentId, enabled);
  const grid = useMemo(() => teacherWeek(query.data ?? [], week.weekOf), [query.data, week.weekOf]);

  return {
    week,
    grid,
    loading: enabled && query.isLoading,
    error: query.error,
    retry: () => void query.refetch(),
  };
}
