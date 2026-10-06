"use client";

import { DataTable } from "@/components/shared/DataTable";
import { AttendanceSummaryCard } from "@/features/attendance/components/AttendanceSummaryCard";
import { monthLabel } from "@/lib/dates";
import { myAttendanceColumns } from "../my-attendance-columns";
import { useMyAttendance } from "../use-my-attendance";
import { MonthStepper } from "./MonthStepper";

/** Own staff attendance: month picker, totals and the daily list with 12-hour check-in/out. */
export function MyAttendanceSection() {
  const mine = useMyAttendance();
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-card-title font-semibold text-fg">My attendance</h3>
        <MonthStepper value={mine.month} onChange={mine.setMonth} atLatest={mine.isCurrentMonth} />
      </div>
      <AttendanceSummaryCard
        counts={mine.summary}
        caption={`Attendance in ${monthLabel(mine.month)}`}
        loading={mine.query.isLoading}
      />
      <DataTable
        columns={myAttendanceColumns}
        rows={mine.entries}
        getRowId={(row) => row.date}
        loading={mine.query.isLoading}
        error={mine.query.error}
        onRetry={() => mine.query.refetch()}
        emptyTitle="No attendance recorded"
        emptyDescription="The office records staff attendance each school day."
      />
    </section>
  );
}
