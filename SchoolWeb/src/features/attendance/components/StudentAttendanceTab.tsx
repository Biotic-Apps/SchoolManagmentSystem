"use client";

import { ErrorState } from "@/components/shared/ErrorState";
import { MonthCalendar } from "@/components/shared/MonthCalendar";
import { Card, CardContent } from "@/components/ui/Card";
import { monthLabel } from "@/lib/dates";
import { useStudentAttendanceTab } from "../use-student-attendance-tab";
import { AttendanceSummaryCard } from "./AttendanceSummaryCard";

/** Month-by-month attendance of one student (student profile tab, parent view). */
export function StudentAttendanceTab({ studentId }: { studentId: string }) {
  const tab = useStudentAttendanceTab(studentId);

  return (
    <div className="flex flex-col gap-4">
      <AttendanceSummaryCard
        counts={tab.summary}
        caption={`Attendance in ${monthLabel(tab.month)}`}
        loading={tab.query.isLoading}
      />
      <Card>
        <CardContent className="flex flex-col gap-3">
          {tab.query.error ? (
            <ErrorState error={tab.query.error} onRetry={() => tab.query.refetch()} />
          ) : (
            <MonthCalendar month={tab.month} onMonthChange={tab.setMonth} items={tab.items} />
          )}
          {!tab.query.isLoading && !tab.query.error && !tab.hasEntries && (
            <p className="text-label text-fg-muted">No attendance recorded in this month yet.</p>
          )}
          <p className="text-caption text-fg-muted">
            Unmarked days are registers the school has not submitted yet — they are not counted as absences.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
