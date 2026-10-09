"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { PeriodStepper } from "@/components/shared/PeriodStepper";
import { Button } from "@/components/ui/Button";
import { useAdjustmentsTab } from "../use-adjustments-tab";
import { AdjustmentFormDialog } from "./AdjustmentFormDialog";

export function AdjustmentsTab({ branchId }: { branchId: string | null }) {
  const tab = useAdjustmentsTab(branchId);
  const { query } = tab;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <PeriodStepper value={tab.month} onChange={tab.setMonth} />
        <FilterSelect
          label="Staff member"
          allLabel="All staff"
          options={tab.staffOptions}
          value={tab.staffId}
          onChange={tab.setStaffId}
          className="md:w-64"
        />
        {tab.canAdd && (
          <Button className="md:ml-auto" onClick={() => tab.create.show(true)}>
            <Plus />
            Add adjustment
          </Button>
        )}
      </div>
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyTitle="No adjustments"
        emptyDescription="Nothing extra this month. Use Add adjustment for a bonus, arrears, a fine, a deduction or an advance / loan recovery."
      />
      {tab.create.open && (
        <AdjustmentFormDialog month={tab.month} staffId={tab.staffId} staffOptions={tab.staffOptions} onClose={tab.create.close} />
      )}
    </div>
  );
}
