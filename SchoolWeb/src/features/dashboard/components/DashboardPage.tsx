"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { NoticesFeedCard } from "@/features/notices/components/NoticesFeedCard";
import { useDashboard } from "../use-dashboard";
import { AttendanceTodayCard } from "./AttendanceTodayCard";
import { ChildTodayPanel } from "./ChildTodayPanel";
import { DashboardScopeBar } from "./DashboardScopeBar";
import { PendingPanel } from "./PendingPanel";
import { SummaryStats } from "./SummaryStats";
import { TeacherTodayPanel } from "./TeacherTodayPanel";

export function DashboardPage() {
  const dashboard = useDashboard();
  const isParent = dashboard.view === "parent";

  return (
    <>
      <PageHeader title={dashboard.title} description={`Welcome, ${dashboard.greetingName}`} />
      {isParent ? (
        <ChildTodayPanel />
      ) : (
        <>
          <DashboardScopeBar scope={dashboard.scope} />
          {dashboard.showPending && <PendingPanel branchId={dashboard.scope.scope.branchId} />}
          {dashboard.view === "teacher" && <TeacherTodayPanel />}
          {dashboard.attendanceToday && (
            <AttendanceTodayCard counts={dashboard.attendanceToday} linked={dashboard.canOpenAttendance} />
          )}
          <SummaryStats dashboard={dashboard} />
        </>
      )}
      {dashboard.showNoticesFeed && <NoticesFeedCard />}
    </>
  );
}
