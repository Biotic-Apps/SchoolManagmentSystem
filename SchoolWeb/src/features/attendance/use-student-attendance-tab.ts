import { useState } from "react";
import type { CalendarItem } from "@/components/shared/MonthCalendar";
import { currentMonth, monthBounds, type MonthRef } from "@/lib/dates";
import { useStudentAttendance } from "./api";
import { ATTENDANCE_STATUS_LABEL, EMPTY_COUNTS, STATUS_CHOICES } from "./options";
import type { StudentAttendance } from "./types";

function calendarItems(entries: StudentAttendance["entries"]): CalendarItem[] {
  return entries.map((entry) => {
    const label = entry.status ? ATTENDANCE_STATUS_LABEL[entry.status] : "Unmarked";
    return {
      id: entry.date,
      title: entry.remark ? `${label} — ${entry.remark}` : label,
      startDate: entry.date,
      endDate: entry.date,
      tone: STATUS_CHOICES.find((choice) => choice.id === entry.status)?.tone ?? "neutral",
    };
  });
}

/** One student's attendance for a chosen month (unmarked days stay separate from absences). */
export function useStudentAttendanceTab(studentId: string) {
  const [month, setMonth] = useState<MonthRef>(currentMonth());
  const { from, to } = monthBounds(month);
  const query = useStudentAttendance(studentId, from, to);
  const entries = query.data?.entries ?? [];

  return {
    month,
    setMonth,
    query,
    summary: query.data?.summary ?? EMPTY_COUNTS,
    items: calendarItems(entries),
    hasEntries: entries.length > 0,
  };
}
