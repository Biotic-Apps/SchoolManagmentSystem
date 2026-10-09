import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { payrollKeys } from "./keys";
import type { PayrollSettings, PayrollSettingsView } from "./types";

/** School pay rules, read through any branch of the school. */
export function usePayrollSettings(branchId: string | null) {
  return useQuery({
    queryKey: payrollKeys.settings(branchId),
    queryFn: async () => (await http.get<PayrollSettingsView>("/payroll/settings", { branchId })).data,
    enabled: !!branchId,
  });
}

export function useSavePayrollSettings(branchId: string) {
  return useApiMutation({
    mutationFn: (input: PayrollSettings) => http.put(`/payroll/settings?branchId=${branchId}`, input),
    invalidate: [payrollKeys.all],
    success: "Pay rules saved. Recalculate open payroll runs to apply them.",
    toastError: false,
  });
}
