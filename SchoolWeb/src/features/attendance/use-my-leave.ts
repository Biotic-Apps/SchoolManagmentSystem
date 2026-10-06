import { useDialogState } from "@/lib/use-dialog-state";
import { useDecideLeave, useLeaveList } from "./leave-api";
import type { Leave, LeaveKind } from "./types";

/**
 * The caller's own leave requests (scope=mine), narrowed to staff leave or one child's leave,
 * with cancel for requests still waiting for a decision.
 */
export function useMyLeave(filter: { kind: LeaveKind; subjectId?: string | null }, enabled = true) {
  const query = useLeaveList({ scope: "mine" }, enabled);
  const decide = useDecideLeave();
  const cancelDialog = useDialogState<Leave>();
  const create = useDialogState();

  const rows = (query.data ?? []).filter(
    (leave) => leave.kind === filter.kind && (!filter.subjectId || leave.subject.id === filter.subjectId),
  );

  const confirmCancel = () => {
    const leave = cancelDialog.item;
    if (leave) decide.mutate({ id: leave.id, action: "cancel" }, { onSuccess: cancelDialog.close });
  };

  return { query, rows, create, cancelDialog, confirmCancel, cancelling: decide.isPending };
}

export type MyLeaveState = ReturnType<typeof useMyLeave>;
