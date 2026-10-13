"use client";

import { Search } from "lucide-react";
import { NoticesFeedCard } from "@/features/notices/components/NoticesFeedCard";
import { SetupChecklistCard } from "@/features/school-setup/components/SetupChecklistCard";
import { useDashboard } from "../use-dashboard";
import { AttendanceTodayCard } from "./AttendanceTodayCard";
import { ParentHomePanel } from "./parent/ParentHomePanel";
import { DashboardScopeBar } from "./DashboardScopeBar";
import { PendingPanel } from "./PendingPanel";
import { SummaryStats } from "./SummaryStats";
import { TeacherTodayPanel } from "./TeacherTodayPanel";

export function DashboardPage() {
  const dashboard = useDashboard();
  const isParent = dashboard.view === "parent";
  const firstName = dashboard.greetingName.split(" ")[0] || dashboard.greetingName;

  return (
    <>
      {/* Welcome banner */}
      <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent-pink/10 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-[24px] font-bold tracking-[-0.02em] text-fg sm:text-page-title">
            Hey {firstName} <span aria-hidden className="inline-block animate-[wave_2s_ease-in-out_1] origin-[70%_70%]">&#128075;</span>
          </h1>
          <p className="text-label text-fg-muted">
            {dashboard.title} &mdash; here is what is happening today.
          </p>
        </div>
        {/* Search on desktop */}
        <div className="relative hidden sm:block sm:w-72">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-muted/60"
          />
          <input
            type="search"
            placeholder="Search anything..."
            aria-label="Search dashboard"
            className="h-10 w-full rounded-full border border-border/50 bg-surface/80 pl-10 pr-4 text-label text-fg placeholder:text-fg-muted/50 outline-none backdrop-blur-sm transition-all duration-200 focus:border-primary/40 focus:bg-surface focus:shadow-sm [&::-webkit-search-cancel-button]:hidden"
          />
        </div>
      </div>

      {isParent ? (
        <ParentHomePanel />
      ) : (
        <>
          <DashboardScopeBar scope={dashboard.scope} />
          <SetupChecklistCard branchId={dashboard.scope.scope.branchId} />
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
