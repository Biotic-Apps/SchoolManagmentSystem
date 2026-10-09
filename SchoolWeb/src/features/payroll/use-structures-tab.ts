import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { useDialogState } from "@/lib/use-dialog-state";
import { useAddPrincipalToPayroll, usePayrollStaff } from "./payroll-staff-api";
import type { PayrollStaffRow } from "./types";

/** Staff on the payroll of a branch (every staff type); selecting one opens their salary. */
export function useStructuresTab(branchId: string | null) {
  const can = useCan();
  const [staffType, setStaffType] = useState<string | undefined>(undefined);
  const query = usePayrollStaff(branchId, staffType);
  const drawer = useDialogState<PayrollStaffRow>();
  const addPrincipal = useAddPrincipalToPayroll();
  const principal = query.data?.principal ?? null;
  return {
    staffType,
    setStaffType,
    query,
    rows: query.data?.items,
    missingCount: query.data?.missingCount ?? 0,
    /** The principal has a login but no payroll record yet. */
    principalMissing: !!principal && !principal.staffId,
    principalName: principal?.name ?? "",
    canEdit: can("payroll.edit"),
    addPrincipal: () => branchId && addPrincipal.mutate(branchId),
    addingPrincipal: addPrincipal.isPending,
    loading: !branchId || query.isLoading,
    drawer,
  };
}
