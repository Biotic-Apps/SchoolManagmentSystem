import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { accountKeys } from "./keys";
import type { IncomeCategory, IncomeCategoryInput } from "./types";

export function useIncomeCategories(schoolId: string | null) {
  return useQuery({
    queryKey: accountKeys.incomeCategories(schoolId),
    queryFn: async () => (await http.get<IncomeCategory[]>("/income-categories", { schoolId })).data,
    enabled: !!schoolId,
  });
}

/** The create carries `schoolId` in the body (CreateIncomeCategoryDto); the list filters by query. */
export function useCreateIncomeCategory(schoolId: string | null) {
  return useApiMutation({
    mutationFn: async (input: IncomeCategoryInput) =>
      (await http.post<IncomeCategory>("/income-categories", { ...input, schoolId: schoolId ?? undefined })).data,
    invalidate: [accountKeys.all],
    success: (category) => `${category.name} added`,
    toastError: false,
  });
}
