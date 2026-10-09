import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { payrollKeys } from "./keys";
import type { OvertimeInput, OvertimeList } from "./types";

export function useOvertime(branchId: string | null, month: string) {
  return useQuery({
    queryKey: payrollKeys.overtime(branchId, month),
    queryFn: async () => (await http.get<OvertimeList>("/payroll/overtime", { branchId, month })).data,
    placeholderData: keepPreviousData,
    enabled: !!branchId,
  });
}

export function useScanOvertime() {
  return useApiMutation({
    mutationFn: async (input: { branchId: string; month: string }) =>
      (await http.post<{ created: number; updated: number; removed: number }>("/payroll/overtime/scan", input)).data,
    invalidate: [payrollKeys.all],
    success: (result) =>
      result.created > 0
        ? `Found ${result.created} new overtime ${result.created === 1 ? "entry" : "entries"} in attendance`
        : "No new overtime found in attendance",
  });
}

export function useAddOvertime() {
  return useApiMutation({
    mutationFn: (input: OvertimeInput) => http.post("/payroll/overtime", input),
    invalidate: [payrollKeys.all],
    success: "Overtime added. It waits for approval before it is paid.",
    toastError: false,
  });
}

export function useDecideOvertime() {
  return useApiMutation({
    mutationFn: (input: { ids: string[]; decision: "APPROVED" | "REJECTED" }) => http.post("/payroll/overtime/decide", input),
    invalidate: [payrollKeys.all],
    success: (_data, input) => (input.decision === "APPROVED" ? "Overtime approved" : "Overtime rejected"),
  });
}

export function useRemoveOvertime() {
  return useApiMutation({
    mutationFn: (id: string) => http.delete(`/payroll/overtime/${id}`),
    invalidate: [payrollKeys.all],
    success: "Overtime removed",
  });
}
