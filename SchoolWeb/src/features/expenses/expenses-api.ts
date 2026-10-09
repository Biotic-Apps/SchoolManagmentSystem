import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { withRowFlash } from "@/lib/row-highlight";
import { useApiMutation } from "@/lib/use-api-mutation";
import { expenseKeys } from "./keys";
import type { Expense, ExpenseInput, ExpensePaymentInput } from "./types";

const INVALIDATE = [expenseKeys.all, ["dashboard"]];

export function useExpenses(params: Query, enabled = true) {
  return useQuery({
    queryKey: expenseKeys.list(params),
    queryFn: () => http.get<Expense[]>("/expenses", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useCreateExpense() {
  return useApiMutation({
    mutationFn: withRowFlash(
      async (input: ExpenseInput) => (await http.post<Expense>("/expenses", input)).data,
      (expense) => expense.id,
    ),
    invalidate: INVALIDATE,
    success: "Expense saved as draft",
    toastError: false,
  });
}

export function useSubmitExpense(id: string) {
  return useApiMutation({
    mutationFn: () => http.post<Expense>(`/expenses/${id}/submit`),
    invalidate: [...INVALIDATE, ["approvals"]],
    success: "Expense sent for approval",
  });
}

export function useRecordExpensePayment(id: string) {
  return useApiMutation({
    mutationFn: (input: ExpensePaymentInput) => http.post<Expense>(`/expenses/${id}/payments`, input),
    invalidate: INVALIDATE,
    success: "Payment recorded",
    toastError: false,
  });
}

/** Signed link for a stored file (phase 1: GET /files/:id/url, valid 5 minutes). */
export function useFileUrl(fileId: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: expenseKeys.fileUrl(fileId ?? ""),
    queryFn: async () => (await http.get<{ url: string }>(`/files/${fileId}/url`)).data.url,
    enabled: enabled && !!fileId,
    staleTime: 4 * 60 * 1000,
  });
}
