"use client";

import { DataTable } from "@/components/shared/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
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
      <PeriodStepper value={tab.month} onChange={tab.setMonth} max={tab.max} />
      {tab.loading && <Skeleton className="h-48 w-full" />}
      {!tab.loading && !!tab.error && <ErrorState error={tab.error} onRetry={tab.retry} />}
      {!tab.loading && !tab.error && !run && (
        <CreateRunEmpty month={tab.month} canCreate={tab.canCreate} creating={tab.creating} onCreate={tab.createRun} />
      )}
      {!tab.loading && !tab.error && run && (
        <>
          <RunOverview run={run} lines={tab.lines} />
          <RunTotals totals={tab.totals} staffCount={tab.lines.length} />
          <DataTable
            columns={tab.columns}
            rows={tab.lines}
            getRowId={(row) => row.staffId}
            emptyTitle="No salary lines yet"
            emptyDescription="Calculate the run to build a line for every staff member with a salary structure."
          />
          {tab.payment.item && <PaymentDialog runId={run.id} line={tab.payment.item} onClose={tab.payment.close} />}
          <PayslipDrawer line={tab.payslip.item} month={run.month} onClose={tab.payslip.close} />
        </>
      )}
    </div>
  );
}
