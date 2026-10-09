"use client";

import { DataTable } from "@/components/shared/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { PeriodStepper } from "@/components/shared/PeriodStepper";
import { Skeleton } from "@/components/ui/Skeleton";
import { useRunsTab } from "../use-runs-tab";
import { CreateRunEmpty } from "./CreateRunEmpty";
import { PaymentDialog } from "./PaymentDialog";
import { PayslipDrawer } from "./PayslipDrawer";
import { RunOverview } from "./RunOverview";
import { RunTotals } from "./RunTotals";

export function RunsTab({ branchId }: { branchId: string | null }) {
  const tab = useRunsTab(branchId);
  const { run } = tab;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <PeriodStepper value={tab.month} onChange={tab.setMonth} max={tab.max} />
        {run && tab.staffTypeOptions.length > 1 && (
          <FilterSelect
            label="Staff type"
            allLabel="All staff types"
            options={tab.staffTypeOptions}
            value={tab.staffType}
            onChange={tab.setStaffType}
            className="md:w-56"
          />
        )}
      </div>
      {tab.loading && <Skeleton className="h-48 w-full" />}
      {!tab.loading && !!tab.error && <ErrorState error={tab.error} onRetry={tab.retry} />}
      {!tab.loading && !tab.error && !run && (
        <CreateRunEmpty month={tab.month} canCreate={tab.canCreate} creating={tab.creating} onCreate={tab.createRun} />
      )}
      {!tab.loading && !tab.error && run && (
        <>
          <RunOverview run={run} lines={tab.allLines} />
          <RunTotals totals={tab.totals} staffCount={tab.lines.length} />
          <DataTable
            columns={tab.columns}
            rows={tab.lines}
            getRowId={(row) => row.staffId}
            onRowClick={tab.payslip.show}
            emptyTitle="No salary lines yet"
            emptyDescription="Calculate the run to build a line for every staff member with a salary. Staff without a salary are listed in the Salary setup tab."
          />
          {tab.payment.item && <PaymentDialog runId={run.id} line={tab.payment.item} onClose={tab.payment.close} />}
          <PayslipDrawer line={tab.payslip.item} month={run.month} approved={tab.approved} onClose={tab.payslip.close} />
        </>
      )}
    </div>
  );
}
