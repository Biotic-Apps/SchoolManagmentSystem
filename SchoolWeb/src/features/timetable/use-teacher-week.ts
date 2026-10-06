import { useMemo, useState } from "react";
import { useStaffOptions } from "@/features/staff/api";
import { useTeacherTimetable } from "./api";
import { teacherWeek } from "./grid";
import { useWeek } from "./use-week";

export function useTeacherWeek(branchId: string) {
  const teachers = useStaffOptions(branchId, "TEACHER");
  const [staffId, setStaffId] = useState<string | null>(null);
  const week = useWeek();
  const query = useTeacherTimetable(staffId, week.weekOf);
  const grid = useMemo(() => teacherWeek(query.data ?? [], week.weekOf), [query.data, week.weekOf]);

  return {
    teachers,
    staffId,
    setStaffId,
    teacherName: teachers.options.find((option) => option.id === staffId)?.name ?? "",
    week,
    grid,
    loading: !!staffId && query.isLoading,
    error: query.error,
    retry: () => void query.refetch(),
  };
}
