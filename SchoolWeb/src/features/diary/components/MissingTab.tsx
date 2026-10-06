"use client";

import { DataTable } from "@/components/shared/DataTable";
import { DateStepper } from "@/components/shared/DateStepper";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import { todayIso } from "@/lib/dates";
import { missingColumns, missingKey } from "../missing-columns";
import { useMissingTab } from "../use-missing-tab";

const COLUMNS = missingColumns();

export function MissingTab() {
  const { picker, date, setDate, query } = useMissingTab();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <BranchPickerSelect picker={picker} />
        <DateStepper value={date} onChange={setDate} max={todayIso()} />
      </div>
      <DataTable
        columns={COLUMNS}
        rows={query.data}
        getRowId={missingKey}
        loading={picker.isLoading || query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyTitle="No missing diaries"
        emptyDescription="Every timetabled subject has a published diary entry for this day."
      />
    </div>
  );
}
