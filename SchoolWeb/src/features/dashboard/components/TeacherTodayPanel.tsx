"use client";

import { ErrorState } from "@/components/shared/ErrorState";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTeacherTodayPanel } from "../use-teacher-today";
import { CountLinkCard } from "./CountLinkCard";
import { TeacherDiariesCard } from "./TeacherDiariesCard";
import { TeacherPeriodsCard } from "./TeacherPeriodsCard";
import { TeacherRegistersCard } from "./TeacherRegistersCard";

export function TeacherTodayPanel() {
  const today = useTeacherTodayPanel();
  const { query, links } = today;

  if (query.isLoading) return <Skeleton className="h-64 w-full rounded-card" />;
  if (query.error) {
    return (
      <Card>
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </Card>
    );
  }

  return (
    <section aria-label="Today" className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {links.messages && <CountLinkCard label="Unread messages" count={today.unreadMessages} href={links.messages} />}
        {links.complaints && (
          <CountLinkCard label="Complaints assigned to you" count={today.assignedComplaints} href={links.complaints} />
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <TeacherPeriodsCard periods={today.periods} href={links.timetable} />
        {/* The stacked cards share the height of the periods card next to them. */}
        <div className="flex flex-col gap-4 [&>*]:flex-1">
          <TeacherRegistersCard registers={today.registers} href={links.attendance} />
          <TeacherDiariesCard diaries={today.diaries} href={links.diary} />
        </div>
      </div>
    </section>
  );
}
