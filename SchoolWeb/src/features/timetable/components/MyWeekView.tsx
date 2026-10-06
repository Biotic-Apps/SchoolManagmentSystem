"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { useMyWeek } from "../use-my-week";
import { TeacherWeekGrid } from "./TeacherWeekGrid";
import { WeekNav } from "./WeekNav";

/** Teacher/helper: own schedule including substitute periods. */
export function MyWeekView() {
  const { week, grid, loading, error, retry } = useMyWeek();
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="My Timetable" description="Your periods for the week, including substitutions." />
      <WeekNav week={week} />
      <TeacherWeekGrid
        caption={`My timetable, week of ${week.label}`}
        week={grid}
        loading={loading}
        error={error}
        onRetry={retry}
        showSection
        emptyDescription="No periods are assigned to you this week."
      />
    </div>
  );
}
