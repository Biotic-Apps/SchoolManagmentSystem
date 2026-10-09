"use client";

import { CalendarCheck } from "lucide-react";
import { ErrorState } from "@/components/shared/ErrorState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/Card";
import { NoChildState } from "@/features/auth/components/NoChildState";
import { useChildTodayPanel } from "../use-child-today";
import { ChildDiaryCard } from "./ChildDiaryCard";
import { ChildNoticesCard } from "./ChildNoticesCard";
import { ConsentFormsCard } from "./ConsentFormsCard";
import { NextMeetingCard } from "./NextMeetingCard";
import { TodayCard } from "./TodayCard";

export function ChildTodayPanel() {
  const { child, query, data, links } = useChildTodayPanel();

  if (!child) return <NoChildState description="Once the school verifies your link to a child, their day appears here." />;
  if (query.isLoading) {
    return (
      <div role="status" aria-label="Loading today" className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SkeletonCard lines={1} />
        <SkeletonCard lines={1} />
        <SkeletonCard lines={2} className="md:col-span-2" />
      </div>
    );
  }
  if (query.error || !data) {
    return (
      <Card>
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </Card>
    );
  }

  return (
    <section aria-label={`${child.name} today`} className="stagger flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TodayCard title={`${child.name} today`} icon={CalendarCheck} href={links.attendance} linkLabel="Attendance">
          <div className="flex items-center justify-between gap-3">
            <span className="text-label text-fg-muted">Attendance</span>
            {data.attendance?.status ? (
              <StatusBadge status={data.attendance.status} />
            ) : (
              <span className="text-label text-fg-muted">Not marked yet</span>
            )}
          </div>
        </TodayCard>
        {links.timetable ? <ConsentFormsCard count={data.consentsPending} href={links.timetable} /> : null}
      </div>
      <ChildDiaryCard entries={data.diary} href={links.diary} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChildNoticesCard notices={data.notices} href={links.messages} />
        <NextMeetingCard meeting={data.nextMeeting} href={links.meetings} />
      </div>
    </section>
  );
}
