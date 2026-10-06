import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { useBranchPicker } from "@/features/branches/use-branch-picker";

export type ExpensesTabId = "expenses" | "vendors" | "categories";

export function useExpensesRoute() {
  const can = useCan();
  const picker = useBranchPicker();
  const [tab, setTab] = useState<ExpensesTabId>("expenses");

  return {
    picker,
    branchId: picker.branchId,
    schoolId: picker.schoolId,
    noBranch: !picker.isLoading && !picker.branchId,
    tab,
    setTab: (value: string) => setTab(value as ExpensesTabId),
    canAdd: can("expenses.add"),
  };
}
