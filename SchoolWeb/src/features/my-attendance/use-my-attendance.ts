import { useState } from "react";
import { useMyStaffAttendance } from "@/features/attendance/staff-attendance-api";
import { EMPTY_COUNTS } from "@/features/attendance/options";
import { currentMonth, monthBounds, type MonthRef } from "@/lib/dates";

/** The signed-in staff member's own attendance for a chosen month, newest day first. */
export function useMyAttendance() {
  const [month, setMonth] = useState<MonthRef>(currentMonth());
  const { from, to } = monthBounds(month);
  const query = useMyStaffAttendance(from, to);
  const entries = [...(query.data?.entries ?? [])].sort((a, b) => b.date.localeCompare(a.date));

  return {
    month,
    setMonth,
    isCurrentMonth: month.year === currentMonth().year && month.month === currentMonth().month,
    query,
    entries,
    summary: query.data?.summary ?? EMPTY_COUNTS,
  };
}

export type MyAttendanceState = ReturnType<typeof useMyAttendance>;
