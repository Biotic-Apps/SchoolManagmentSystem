"use client";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { RunActionsState } from "../use-run-actions";

const COPY = {
  approve: {
    title: "Send payroll for approval?",
    description:
      "The run goes to the approver as one request. A line for the approver's own salary is routed to the super admin, and nobody can approve their own salary. Adjustments for this month are approved with the run.",
    confirmLabel: "Send for approval",
  },
  close: {
    title: "Close this payroll run?",
    description: "Every salary is paid. Closing locks the run; payments can no longer be recorded against it.",
    confirmLabel: "Close run",
  },
};

export function RunConfirmDialog({ actions }: { actions: RunActionsState }) {
  const copy = COPY[actions.confirm.item ?? "approve"];
  return (
    <ConfirmDialog
      open={actions.confirm.open}
      onOpenChange={actions.confirm.onOpenChange}
      title={copy.title}
      description={copy.description}
      confirmLabel={copy.confirmLabel}
      loading={actions.confirming}
      onConfirm={actions.confirmAction}
    />
  );
}
