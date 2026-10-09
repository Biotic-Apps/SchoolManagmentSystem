"use client";

import { CheckCheck, Plus, ScanSearch } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { PeriodStepper } from "@/components/shared/PeriodStepper";
import { Button } from "@/components/ui/Button";
import { todayIso } from "@/lib/dates";
import { hoursText } from "../options";
import { useOvertimeTab } from "../use-overtime-tab";
import { OvertimeFormDialog } from "./OvertimeFormDialog";

export function OvertimeTab({ branchId }: { branchId: string | null }) {
  const tab = useOvertimeTab(branchId);
  const { data } = tab;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <PeriodStepper value={tab.month} onChange={tab.setMonth} max={tab.max} />
        <div className="flex flex-wrap gap-2 md:ml-auto">
          {tab.canScan && (
            <Button variant="secondary" loading={tab.scanning} onClick={tab.scanNow}>
              <ScanSearch />
              Find in attendance
            </Button>
          )}
          {tab.canAdd && (
            <Button variant="secondary" onClick={() => tab.create.show(true)}>
              <Plus />
              Add overtime
            </Button>
          )}
          {tab.canApproveAll && (
            <Button loading={tab.approving} onClick={tab.approveAll}>
              <CheckCheck />
              Approve all pending
            </Button>
          )}
        </div>
      </div>
      {data && !data.overtimeEnabled && (
        <InlineNotice tone="warning">Overtime pay is switched off in Pay rules. Entries are kept but not paid.</InlineNotice>
      )}
      {data?.overtimeEnabled && (
        <InlineNotice>
          {data.staffLeavesAt
            ? `Anyone who checks out after ${data.staffLeavesAt} (the staff leave time) gets an overtime entry here.`
            : "Set the staff leave time in the branch timings so late check-outs count as overtime."}{" "}
          Only approved overtime is paid; recalculate the payroll run after approving.
          {data.approvedMinutes > 0 && ` Approved this month: ${hoursText(data.approvedMinutes)}.`}
        </InlineNotice>
      )}
      {data?.locked && <InlineNotice tone="warning">This month&apos;s payroll is approved, so its overtime can no longer change.</InlineNotice>}
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={tab.query.isLoading}
        error={tab.query.error}
        onRetry={() => tab.query.refetch()}
        emptyTitle="No overtime this month"
        emptyDescription="Record check-out times in staff attendance, then press Find in attendance. Or add extra hours by hand."
      />
      {tab.create.open && (
        <OvertimeFormDialog date={todayIso().startsWith(tab.month) ? todayIso() : `${tab.month}-01`} staffOptions={tab.staffOptions} onClose={tab.create.close} />
      )}
    </div>
  );
}
