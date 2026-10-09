"use client";

import { ErrorState } from "@/components/shared/ErrorState";
import { Card } from "@/components/ui/Card";
import { NoChildState } from "@/features/auth/components/NoChildState";
import { useParentHomePanel } from "../../use-parent-home";
import { ChildNoticesCard } from "../ChildNoticesCard";
import { ConsentFormsCard } from "../ConsentFormsCard";
import { ChildHeaderCard } from "./ChildHeaderCard";
import { ParentHomeSkeleton } from "./ParentHomeSkeleton";
import { ParentKpiTiles } from "./ParentKpiTiles";
import { ParentQuickActions } from "./ParentQuickActions";
import { RecentDiaryCard } from "./RecentDiaryCard";
import { TodayTimetableStrip } from "./TodayTimetableStrip";
import { UpcomingCard } from "./UpcomingCard";

/** Parent dashboard for the child picked in the Topbar switcher. */
export function ParentHomePanel() {
  const { child, query, data, links } = useParentHomePanel();

  if (!child) return <NoChildState description="Once the school verifies your link to a child, their day appears here." />;
  if (query.isLoading) return <ParentHomeSkeleton />;
  if (query.error || !data) {
    return (
      <Card>
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </Card>
    );
  }

  return (
    <section aria-label={`${data.child.name}'s dashboard`} className="stagger flex flex-col gap-4">
      <ChildHeaderCard child={data.child} today={data.attendance.today} />
      <ParentKpiTiles data={data} links={links} />
      <ParentQuickActions data={data} links={links} />
      <TodayTimetableStrip periods={data.todayPeriods} href={links.timetable} />
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RecentDiaryCard entries={data.diary} href={links.diary} />
        </div>
        <div className="flex flex-col gap-4 lg:col-span-2">
          <UpcomingCard meetings={data.meetings} events={data.events} href={links.meetings} />
          <ChildNoticesCard notices={data.notices} href={links.notices ?? links.messages} />
          {data.consentsPending > 0 && links.activities && (
            <ConsentFormsCard count={data.consentsPending} href={links.activities} />
          )}
        </div>
      </div>
    </section>
  );
}
