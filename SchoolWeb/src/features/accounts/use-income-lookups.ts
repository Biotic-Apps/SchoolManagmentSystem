import { useMemo } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { EMPTY_VALUE } from "@/lib/format";
import { useIncomeCategories } from "./categories-api";
import type { Income } from "./types";

export function useIncomeLookups(schoolId: string | null) {
  const categories = useIncomeCategories(schoolId);

  return useMemo(() => {
    const categoryOptions: Option[] = (categories.data ?? []).map((item) => ({ id: item.id, name: item.name }));
    const categoryNames = new Map(categoryOptions.map((option) => [option.id, option.name]));

    return {
      categoryOptions,
      categoryName: (income: Income) =>
        income.category?.name ?? categoryNames.get(income.categoryId ?? "") ?? EMPTY_VALUE,
    };
  }, [categories.data]);
}

export type IncomeLookups = ReturnType<typeof useIncomeLookups>;
