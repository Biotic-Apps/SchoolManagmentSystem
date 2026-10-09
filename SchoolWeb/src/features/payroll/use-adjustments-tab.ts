import { useMemo, useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { useStaffOptions } from "@/features/staff/api";
import { currentPeriod } from "@/lib/period";
import { useDialogState } from "@/lib/use-dialog-state";
import { adjustmentColumns } from "./adjustment-columns";
import { usePayrollAdjustments } from "./adjustments-api";

/** Bonuses, arrears, deductions, fines and advance recoveries of a branch month, optionally for one staff member. */
export function useAdjustmentsTab(branchId: string | null) {
  const can = useCan();
  const [month, setMonth] = useState(currentPeriod());
  const [staffId, setStaffId] = useState<string | undefined>(undefined);
  const staff = useStaffOptions(branchId);
  const query = usePayrollAdjustments({ branchId, month, staffId });
  const create = useDialogState<true>();

  const columns = useMemo(() => {
    const names = new Map(staff.options.map((option) => [option.id, option.name]));
    return adjustmentColumns((id) => names.get(id));
  }, [staff.options]);

  return {
    month,
    setMonth,
    staffId,
    setStaffId,
    staffOptions: staff.options,
    query,
    rows: query.data,
    columns,
    canAdd: can("payroll.edit") && !!branchId,
    create,
  };
}
