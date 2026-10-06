"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import { useIncidentsTab } from "../use-incidents-tab";
import { DateRangeInputs } from "./DateRangeInputs";
import { IncidentDetailDrawer } from "./IncidentDetailDrawer";
import { ReportIncidentDialog } from "./ReportIncidentDialog";

export function IncidentsTab() {
  const tab = useIncidentsTab();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <BranchPickerSelect picker={tab.picker} className="md:w-56" />
        <DateRangeInputs from={tab.from} to={tab.to} onFromChange={tab.setFrom} onToChange={tab.setTo} />
        <Button className="md:ml-auto" onClick={() => tab.setReporting(true)}>
          <Plus />
          Report incident
        </Button>
      </div>
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={tab.query.isLoading || tab.picker.isLoading}
        error={tab.query.error ?? tab.picker.error}
        onRetry={() => tab.query.refetch()}
        onRowClick={tab.detail.show}
        pagination={tab.pagination}
        emptyTitle="No incidents in this period"
        emptyDescription="Injuries, illnesses and allergic reactions reported by staff appear here."
      />
      <IncidentDetailDrawer incident={tab.selected} open={tab.detail.open} onOpenChange={tab.detail.onOpenChange} />
      {tab.reporting && <ReportIncidentDialog branchId={tab.picker.branchId} onClose={() => tab.setReporting(false)} />}
    </div>
  );
}
