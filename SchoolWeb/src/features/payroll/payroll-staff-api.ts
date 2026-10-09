import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { payrollKeys } from "./keys";
import type { PayrollStaffList } from "./types";

/** Active staff of every type with their current salary (null = not set yet). */
export function usePayrollStaff(branchId: string | null, designation?: string) {
  return useQuery({
    queryKey: payrollKeys.staff(branchId, designation),
    queryFn: async () => (await http.get<PayrollStaffList>("/payroll/staff", { branchId, designation })).data,
    placeholderData: keepPreviousData,
    enabled: !!branchId,
  });
}

/** Creates the principal's payroll record so a salary can be set. */
export function useAddPrincipalToPayroll() {
  return useApiMutation({
    mutationFn: (branchId: string) => http.post("/payroll/staff/principal", { branchId }),
    invalidate: [payrollKeys.all, ["staff"]],
    success: "Principal added to payroll. Set their salary next.",
  });
}
