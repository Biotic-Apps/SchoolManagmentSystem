import { useMemo, useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { useStaffOptions } from "@/features/staff/api";
import { currentPeriod } from "@/lib/period";
import { useDialogState } from "@/lib/use-dialog-state";
import { useDecideOvertime, useOvertime, useRemoveOvertime, useScanOvertime } from "./overtime-api";
import { overtimeColumns } from "./overtime-columns";
import type { OvertimeEntry } from "./types";

/** Overtime of a branch month: found in attendance or added by hand; paid only after approval. */
export function useOvertimeTab(branchId: string | null) {
  const can = useCan();
  const [month, setMonth] = useState(currentPeriod());
  const query = useOvertime(branchId, month);
  const staff = useStaffOptions(branchId);
  const scan = useScanOvertime();
  const decide = useDecideOvertime();
  const remove = useRemoveOvertime();
  const create = useDialogState<true>();
  const data = query.data;
  const locked = !!data?.locked;
  const canApprove = can("payroll.approve");
  const canEdit = can("payroll.edit");

  const columns = useMemo(
    () =>
      overtimeColumns({
        canApprove,
        canEdit,
        locked,
        onDecide: (entry: OvertimeEntry, decision) => decide.mutate({ ids: [entry.id], decision }),
        onRemove: (entry: OvertimeEntry) => remove.mutate(entry.id),
      }),
    [canApprove, canEdit, locked, decide, remove],
  );
  const pendingIds = (data?.items ?? []).filter((item) => item.status === "PENDING").map((item) => item.id);

  return {
    month,
    setMonth,
    max: currentPeriod(),
    query,
    data,
    rows: data?.items,
    columns,
    locked,
    staffOptions: staff.options,
    canAdd: canEdit && !!branchId && !locked,
    canScan: !!branchId && !locked && !!data?.overtimeEnabled,
    scanning: scan.isPending,
    scanNow: () => branchId && scan.mutate({ branchId, month }),
    canApproveAll: canApprove && !locked && pendingIds.length > 0,
    approving: decide.isPending,
    approveAll: () => decide.mutate({ ids: pendingIds, decision: "APPROVED" }),
    create,
  };
}
