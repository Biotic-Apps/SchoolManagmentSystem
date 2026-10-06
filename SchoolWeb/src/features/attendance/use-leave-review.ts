import { useState } from "react";
import { useDialogState } from "@/lib/use-dialog-state";
import { useDecideLeave, useLeaveList } from "./leave-api";
import type { Leave, LeaveStatus } from "./types";

type Decision = "approve" | "reject";

/** Leave requests the caller can decide (student leave: class teacher/principal; staff: principal). */
export function useLeaveReview() {
  const [status, setStatus] = useState<LeaveStatus | undefined>("SUBMITTED");
  const query = useLeaveList({ scope: "review", status });
  const decide = useDecideLeave();
  const dialog = useDialogState<{ leave: Leave; action: Decision }>();

  const confirm = (comment: string) => {
    const item = dialog.item;
    if (!item) return;
    decide.mutate({ id: item.leave.id, action: item.action, comment: comment || undefined }, { onSuccess: dialog.close });
  };

  return {
    query,
    status,
    setStatus: (value: string | undefined) => setStatus(value as LeaveStatus | undefined),
    dialog,
    openDecision: (leave: Leave, action: Decision) => dialog.show({ leave, action }),
    confirm,
    deciding: decide.isPending,
  };
}
