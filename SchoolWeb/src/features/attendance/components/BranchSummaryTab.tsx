"use client";

import { CheckCircle2, ClipboardList, UserX, Users } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { DateStepper } from "@/components/shared/DateStepper";
import { StatCard } from "@/components/shared/StatCard";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import { todayIso } from "@/lib/dates";
import { EMPTY_VALUE, formatNumber } from "@/lib/format";
import { summaryColumns } from "../summary-columns";
import type { AttendancePageState } from "../use-attendance-page";
import { useBranchSummary } from "../use-branch-summary";
import { UnmarkedSectionsCard } from "./UnmarkedSectionsCard";

export function BranchSummaryTab({ page }: { page: AttendancePageState }) {
  const academic = page.sectionScope.scope;
  const { summary, unmarked, rows, totals, submittedCount } = useBranchSummary(academic.branchId, page.date);
  const loading = summary.isLoading;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <BranchPickerSelect picker={academic.picker} className="md:w-56" />
        <DateStepper value={page.date} onChange={page.setDate} max={todayIso()} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Attendance"
          value={totals.percent === null ? EMPTY_VALUE : `${totals.percent}%`}
          hint="Present and late, of students marked"
          icon={CheckCircle2}
          loading={loading}
        />
        <StatCard label="Present" value={formatNumber(totals.present + totals.late)} hint={`${formatNumber(totals.late)} late`} icon={Users} loading={loading} />
        <StatCard label="Absent" value={formatNumber(totals.absent)} hint={`${formatNumber(totals.leave)} on leave · ${formatNumber(totals.unmarked)} unmarked`} icon={UserX} loading={loading} />
        <StatCard label="Registers submitted" value={`${submittedCount} / ${rows.length}`} icon={ClipboardList} loading={loading} />
      </div>
      <div className="grid gap-4 2xl:grid-cols-[1fr_20rem]">
        <DataTable
          columns={summaryColumns}
          rows={summary.data}
          getRowId={(row) => row.sectionId}
          loading={loading}
          error={summary.error}
          onRetry={() => summary.refetch()}
          onRowClick={(row) => page.openRegister(row.sectionId)}
          emptyTitle="No sections"
          emptyDescription="Sections of this branch appear here once they are set up for the session."
        />
        <UnmarkedSectionsCard query={unmarked} onOpen={page.openRegister} />
      </div>
    </div>
  );
}
