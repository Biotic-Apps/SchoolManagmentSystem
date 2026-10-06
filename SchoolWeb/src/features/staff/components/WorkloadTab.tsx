"use client";

import { BookOpen, CalendarClock, LayoutGrid } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { StatCard } from "@/components/shared/StatCard";
import { formatNumber } from "@/lib/format";
import { useWorkloadTab } from "../use-workload-tab";
import { SessionPicker } from "./SessionPicker";
import { WorkloadList } from "./WorkloadList";

export function WorkloadTab({ staffId, branchId }: { staffId: string; branchId: string | null }) {
  const tab = useWorkloadTab(staffId, branchId);

  if (!tab.loading && !tab.hasSessions) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No academic sessions yet"
        description="Workload is counted per session. Create a session in Sessions & Calendar first."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <SessionPicker picker={tab.session} />
      {tab.query.error ? (
        <ErrorState error={tab.query.error} onRetry={() => tab.query.refetch()} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Periods per week" value={formatNumber(tab.periodsPerWeek)} icon={CalendarClock} loading={tab.loading} />
            <StatCard label="Sections" value={formatNumber(tab.sections.count)} icon={LayoutGrid} loading={tab.loading} />
            <StatCard label="Subjects" value={formatNumber(tab.subjects.count)} icon={BookOpen} loading={tab.loading} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <WorkloadList title="Sections" names={tab.sections.names} />
            <WorkloadList title="Subjects" names={tab.subjects.names} />
          </div>
        </>
      )}
    </div>
  );
}
