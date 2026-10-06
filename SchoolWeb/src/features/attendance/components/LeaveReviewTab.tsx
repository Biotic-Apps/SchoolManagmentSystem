"use client";

import { Check, X } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { Button } from "@/components/ui/Button";
import { formatDateRange } from "@/lib/format";
import { leaveReviewColumns } from "../leave-columns";
import { LEAVE_STATUS_OPTIONS } from "../options";
import type { Leave } from "../types";
import { useLeaveReview } from "../use-leave-review";

export function LeaveReviewTab() {
  const review = useLeaveReview();
  const item = review.dialog.item;
  const approving = item?.action === "approve";

  const actions = (row: Leave) =>
    row.status === "SUBMITTED" ? (
      <span className="flex justify-end gap-2">
        <Button size="sm" variant="secondary" onClick={() => review.openDecision(row, "reject")}>
          <X />
          Reject
        </Button>
        <Button size="sm" onClick={() => review.openDecision(row, "approve")}>
          <Check />
          Approve
        </Button>
      </span>
    ) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <FilterSelect
          label="Status"
          options={LEAVE_STATUS_OPTIONS}
          value={review.status}
          onChange={review.setStatus}
          className="md:w-56"
        />
      </div>
      <DataTable
        columns={leaveReviewColumns(actions)}
        rows={review.query.data}
        getRowId={(row) => row.id}
        loading={review.query.isLoading}
        error={review.query.error}
        onRetry={() => review.query.refetch()}
        emptyTitle={review.status === "SUBMITTED" ? "Nothing waiting for you" : "No leave requests"}
        emptyDescription="Leave requests you can decide appear here."
      />
      <ReasonDialog
        open={review.dialog.open}
        onOpenChange={review.dialog.onOpenChange}
        title={approving ? "Approve leave" : "Reject leave"}
        description={item ? `${item.leave.subject.name} · ${formatDateRange(item.leave.from, item.leave.to)}` : undefined}
        label={approving ? "Comment" : "Reason"}
        submitLabel={approving ? "Approve" : "Reject"}
        required={!approving}
        submitting={review.deciding}
        onSubmit={review.confirm}
      />
    </div>
  );
}
