import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
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

/** The create carries `schoolId` in the body (CreateExpenseCategoryDto); the list filters by query. */
export function useCreateExpenseCategory(schoolId: string | null) {
  return useApiMutation({
    mutationFn: async (input: ExpenseCategoryInput) =>
      (await http.post<ExpenseCategory>("/expense-categories", { ...input, schoolId: schoolId ?? undefined })).data,
    invalidate: [expenseKeys.all],
    success: (category) => `${category.name} added`,
    toastError: false,
  });
}
