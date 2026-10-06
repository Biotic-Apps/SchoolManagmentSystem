import { useQuery } from "@tanstack/react-query";
import { http, request } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { expenseKeys } from "./keys";
import type { ExpenseCategory, ExpenseCategoryInput } from "./types";

export function useExpenseCategories(schoolId: string | null) {
  return useQuery({
    queryKey: expenseKeys.categories(schoolId),
    queryFn: async () => (await http.get<ExpenseCategory[]>("/expense-categories", { schoolId })).data,
    enabled: !!schoolId,
  });
}

/** The contract scopes the create by `?schoolId=` like the list. */
export function useCreateExpenseCategory(schoolId: string | null) {
  return useApiMutation({
    mutationFn: async (input: ExpenseCategoryInput) =>
      (await request<ExpenseCategory>("/expense-categories", { method: "POST", body: input, query: { schoolId } })).data,
    invalidate: [expenseKeys.all],
    success: (category) => `${category.name} added`,
    toastError: false,
  });
}
