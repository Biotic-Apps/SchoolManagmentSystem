"use client";

import { UserRound } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { ChildActivitiesSection } from "@/features/activities/components/ChildActivitiesSection";
import { useChildTimetable } from "../use-child-timetable";
import { TeacherWeekGrid } from "./TeacherWeekGrid";
import { WeekNav } from "./WeekNav";

/** PARENT: read-only week of the child picked in the top bar. */
export function ChildTimetableView() {
  const { title, child, description, week, grid, loading, error, retry } = useChildTimetable();
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={title} description={description} />
      {!child ? (
        <Card>
          <EmptyState icon={UserRound} title="No child linked" description="Once your child link is verified, their timetable appears here." />
        </Card>
      ) : (
        <>
          <WeekNav week={week} />
          <TeacherWeekGrid
            caption={`${child.name}'s timetable, week of ${week.label}`}
            week={grid}
            loading={loading}
            error={error}
            onRetry={retry}
            showSection={false}
            emptyDescription="No published timetable for this week yet."
          />
          <ChildActivitiesSection className="mt-4" />
        </>
      )}
    </div>
  );
}
