"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { Button } from "@/components/ui/Button";
import { EARLY_LEAVE_STATUS_OPTIONS } from "../options";
import { useEarlyLeaveTab } from "../use-early-leave-tab";
import { EarlyLeaveDialog } from "./EarlyLeaveDialog";

export function EarlyLeaveTab({ branchId, date }: { branchId: string; date: string }) {
  const tab = useEarlyLeaveTab(branchId, date);
  const approveName = tab.approveTarget.item?.student.name;
  const rejectName = tab.rejectTarget.item?.student.name;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <FilterSelect label="Status" options={EARLY_LEAVE_STATUS_OPTIONS} value={tab.status} onChange={tab.setStatus} />
        <Button className="md:ml-auto" onClick={() => tab.setCreating(true)}>
          <Plus />
          New request
        </Button>
      </div>
      <DataTable
        columns={tab.columns}
        rows={tab.query.data}
        getRowId={(row) => row.id}
        loading={tab.query.isLoading}
        error={tab.query.error}
        onRetry={() => tab.query.refetch()}
        emptyTitle="No early-leave requests"
        emptyDescription="Requests from parents and staff for this day appear here."
      />
      {tab.creating && <EarlyLeaveDialog branchId={branchId} date={date} onClose={() => tab.setCreating(false)} />}
      <ReasonDialog
        open={tab.approveTarget.open}
        onOpenChange={tab.approveTarget.onOpenChange}
        title="Approve early leave?"
        description={`${approveName ?? "The student"} may leave early. The gate sees this when recording the departure.`}
        label="Note"
        required={false}
        submitLabel="Approve"
        submitting={tab.deciding}
        onSubmit={tab.approve}
      />
      <ReasonDialog
        open={tab.rejectTarget.open}
        onOpenChange={tab.rejectTarget.onOpenChange}
        title="Reject early leave?"
        description={`The requester is told why ${rejectName ?? "the student"} can't leave early.`}
        submitLabel="Reject"
        submitting={tab.deciding}
        onSubmit={tab.reject}
      />
    </div>
  );
}
