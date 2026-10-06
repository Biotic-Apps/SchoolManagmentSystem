import { useMemo, useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { useDialogState } from "@/lib/use-dialog-state";
import { useDecideEarlyLeave, useEarlyLeaves } from "./api";
import { earlyLeaveColumns } from "./early-leave-columns";
import type { EarlyLeave } from "./types";

export function useEarlyLeaveTab(branchId: string, date: string) {
  const can = useCan();
  const [status, setStatus] = useState<string | undefined>();
  const [creating, setCreating] = useState(false);
  const query = useEarlyLeaves({ branchId, date, status });
  const decide = useDecideEarlyLeave();
  const approveTarget = useDialogState<EarlyLeave>();
  const rejectTarget = useDialogState<EarlyLeave>();

  const canDecide = can("pickup.approve") || can("pickup.edit");
  const { show: showApprove } = approveTarget;
  const { show: showReject } = rejectTarget;
  const columns = useMemo(
    () => earlyLeaveColumns(canDecide ? { onApprove: showApprove, onReject: showReject } : null),
    [canDecide, showApprove, showReject],
  );

  const run = (target: typeof approveTarget, action: "approve" | "reject", reason: string) => {
    if (target.item) decide.mutate({ id: target.item.id, action, reason: reason || undefined }, { onSuccess: target.close });
  };

  return {
    query,
    columns,
    status,
    setStatus,
    creating,
    setCreating,
    approveTarget,
    rejectTarget,
    deciding: decide.isPending,
    approve: (note: string) => run(approveTarget, "approve", note),
    reject: (reason: string) => run(rejectTarget, "reject", reason),
  };
}
