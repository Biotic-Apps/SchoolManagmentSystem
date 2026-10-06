"use client";

import { NotebookPen } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { NoChildState } from "@/features/auth/components/NoChildState";
import { WeekNav } from "@/features/timetable/components/WeekNav";
import { useChildDiary } from "../use-child-diary";
import { DiaryDayList } from "./DiaryDayList";

/** PARENT: read-only published diary of the child picked in the Topbar. */
export function ChildDiaryView() {
  const { child, student, sectionId, week, query, days, caption } = useChildDiary();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Daily Diary & Homework" description={caption} />
      {!child && <NoChildState description="Once your child link is verified, their daily diary appears here." />}
      {student.isLoading && <Skeleton className="h-48 w-full" />}
      {!!student.error && (
        <Card>
          <ErrorState error={student.error} onRetry={() => student.refetch()} />
        </Card>
      )}
      {student.data && !sectionId && (
        <Card>
          <EmptyState title="Not enrolled in a class" description="The diary appears once your child is placed in a section." />
        </Card>
      )}
      {sectionId && (
        <>
          <WeekNav week={week} />
          {query.isLoading && <Skeleton className="h-48 w-full" />}
          {!!query.error && (
            <Card>
              <ErrorState error={query.error} onRetry={() => query.refetch()} />
            </Card>
          )}
          {query.data && days.length === 0 && (
            <Card>
              <EmptyState icon={NotebookPen} title="No diary this week" description="Published diary entries and homework appear here." />
            </Card>
          )}
          <DiaryDayList days={days} />
        </>
      )}
    </div>
  );
}
