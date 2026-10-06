import { useMemo } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { EMPTY_VALUE } from "@/lib/format";
import { useExpenseCategories } from "./categories-api";
import type { Expense } from "./types";
import { useVendors } from "./vendors-api";

const ALL_VENDORS = { page: 1, pageSize: 100 };

/** Category and vendor options, plus name lookups for expenses that only carry ids. */
export function useExpenseLookups(schoolId: string | null) {
  const categories = useExpenseCategories(schoolId);
  const vendors = useVendors(ALL_VENDORS);

  return useMemo(() => {
    const categoryOptions: Option[] = (categories.data ?? []).map((item) => ({ id: item.id, name: item.name }));
    const vendorOptions: Option[] = (vendors.data?.data ?? []).map((item) => ({ id: item.id, name: item.name }));
    const categoryNames = new Map(categoryOptions.map((option) => [option.id, option.name]));
    const vendorNames = new Map(vendorOptions.map((option) => [option.id, option.name]));

    return {
      categoryOptions,
      vendorOptions,
      categoryName: (expense: Expense) =>
        expense.category?.name ?? categoryNames.get(expense.categoryId ?? "") ?? EMPTY_VALUE,
      vendorName: (expense: Expense) => {
        const id = expense.vendor?.id ?? expense.vendorId;
        if (!id) return EMPTY_VALUE;
        return expense.vendor?.name ?? vendorNames.get(id) ?? EMPTY_VALUE;
      },
    };
  }, [categories.data, vendors.data]);
}

export type ExpenseLookups = ReturnType<typeof useExpenseLookups>;
