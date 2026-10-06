import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { payrollKeys } from "./keys";
import { listFrom } from "./normalize";
import type { AdjustmentInput, PayrollAdjustment } from "./types";

export function usePayrollAdjustments(params: Query) {
  return useQuery({
    queryKey: payrollKeys.adjustments(params),
    queryFn: async () => listFrom<PayrollAdjustment>((await http.get<unknown>("/payroll/adjustments", params)).data),
    placeholderData: keepPreviousData,
  });
}

export function useAddPayrollAdjustment() {
  return useApiMutation({
    mutationFn: (input: AdjustmentInput) => http.post<PayrollAdjustment>("/payroll/adjustments", input),
    invalidate: [payrollKeys.all],
    success: "Adjustment added",
    toastError: false,
  });
}
