import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { withRowFlash } from "@/lib/row-highlight";
import { useApiMutation } from "@/lib/use-api-mutation";
import { accountKeys } from "./keys";
import type { Income, IncomeInput } from "./types";

const INVALIDATE = [accountKeys.all, ["dashboard"]];

export function useIncomeList(params: Query, enabled = true) {
  return useQuery({
    queryKey: accountKeys.income(params),
    queryFn: () => http.get<Income[]>("/income", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useCreateIncome() {
  return useApiMutation({
    mutationFn: withRowFlash(
      async (input: IncomeInput) => (await http.post<Income>("/income", input)).data,
      (income) => income.id,
    ),
    invalidate: INVALIDATE,
    success: "Income recorded",
    toastError: false,
  });
}

export function useUpdateIncome(id: string) {
  return useApiMutation({
    mutationFn: (input: Partial<IncomeInput>) => http.patch<Income>(`/income/${id}`, input),
    invalidate: INVALIDATE,
    success: "Income updated",
  });
}

export function useDeleteIncome(id: string) {
  return useApiMutation({
    mutationFn: () => http.delete(`/income/${id}`),
    invalidate: INVALIDATE,
    success: "Income deleted",
  });
}
