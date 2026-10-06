import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { payrollKeys } from "./keys";
import { listFrom } from "./normalize";
import type { PayrollPaymentInput, PayrollRun } from "./types";

const INVALIDATE = [payrollKeys.all, ["dashboard"]];

export function usePayrollRuns(branchId: string | null, month: string) {
  return useQuery({
    queryKey: payrollKeys.runs(branchId, month),
    queryFn: async () => listFrom<PayrollRun>((await http.get<unknown>("/payroll/runs", { branchId, month })).data),
    placeholderData: keepPreviousData,
    enabled: !!branchId,
  });
}

export function usePayrollRun(id: string | null) {
  return useQuery({
    queryKey: payrollKeys.run(id),
    queryFn: async () => (await http.get<PayrollRun>(`/payroll/runs/${id}`)).data,
    enabled: !!id,
  });
}

/** 409 when a run already exists for the branch and month. */
export function useCreatePayrollRun() {
  return useApiMutation({
    mutationFn: async (input: { branchId: string; month: string }) => (await http.post<PayrollRun>("/payroll/runs", input)).data,
    invalidate: INVALIDATE,
    success: "Payroll run created",
    toastError: false,
  });
}

export function useCalculatePayrollRun() {
  return useApiMutation({
    mutationFn: async (id: string) => (await http.post<{ jobId?: string }>(`/payroll/runs/${id}/calculate`)).data,
    invalidate: [payrollKeys.all],
  });
}

export function useReviewPayrollRun() {
  return useApiMutation({
    mutationFn: (id: string) => http.post(`/payroll/runs/${id}/review`),
    invalidate: [payrollKeys.all],
    success: "Marked as reviewed",
  });
}

export function useApprovePayrollRun() {
  return useApiMutation({
    mutationFn: (id: string) => http.post(`/payroll/runs/${id}/approve`),
    invalidate: [payrollKeys.all, ["approvals"]],
    success: "Sent for approval",
  });
}

export function useRecordPayrollPayment(runId: string) {
  return useApiMutation({
    mutationFn: (input: PayrollPaymentInput) => http.post(`/payroll/runs/${runId}/payments`, input),
    invalidate: INVALIDATE,
    success: "Payment recorded",
    toastError: false,
  });
}

export function useClosePayrollRun() {
  return useApiMutation({
    mutationFn: (id: string) => http.post(`/payroll/runs/${id}/close`),
    invalidate: INVALIDATE,
    success: "Payroll run closed",
  });
}
