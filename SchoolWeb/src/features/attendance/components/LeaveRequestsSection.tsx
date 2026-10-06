"use client";

import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { formatDateRange } from "@/lib/format";
import { myLeaveColumns } from "../leave-columns";
import type { Leave } from "../types";
import type { MyLeaveState } from "../use-my-leave";

interface LeaveRequestsSectionProps {
  leave: MyLeaveState;
  title: string;
  description: string;
  /** Staff leave shows its type; student leave has none. */
  withType?: boolean;
  emptyDescription: string;
  /** The request dialog, rendered by the caller. */
  dialog: ReactNode;
}

/** Own leave requests with a "Request leave" action and withdraw for undecided ones. */
export function LeaveRequestsSection({ leave, title, description, withType = false, emptyDescription, dialog }: LeaveRequestsSectionProps) {
  const target = leave.cancelDialog.item;
  const actions = (row: Leave) =>
    row.status === "SUBMITTED" ? (
      <Button size="sm" variant="ghost" onClick={() => leave.cancelDialog.show(row)}>
        Withdraw
      </Button>
    ) : null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-card-title font-semibold text-fg">{title}</h3>
          <p className="text-label text-fg-muted">{description}</p>
        </div>
        <Button onClick={() => leave.create.show()}>
          <Plus />
          Request leave
        </Button>
      </div>
      <DataTable
        columns={myLeaveColumns(actions, withType)}
        rows={leave.rows}
        getRowId={(row) => row.id}
        loading={leave.query.isLoading}
        error={leave.query.error}
        onRetry={() => leave.query.refetch()}
        skeletonRows={3}
        emptyTitle="No leave requests"
        emptyDescription={emptyDescription}
      />
      {dialog}
      <ConfirmDialog
        open={leave.cancelDialog.open}
        onOpenChange={leave.cancelDialog.onOpenChange}
        title="Withdraw this leave request?"
        description={target ? `${formatDateRange(target.from, target.to)} — the request is cancelled and no longer reviewed.` : undefined}
        confirmLabel="Withdraw request"
        tone="danger"
        loading={leave.cancelling}
        onConfirm={leave.confirmCancel}
      />
    </section>
  );
}
