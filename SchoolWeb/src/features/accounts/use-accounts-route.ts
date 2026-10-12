import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { useBranchPicker } from "@/features/branches/use-branch-picker";

export type AccountsTabId = "income" | "categories" | "profit-loss";

export function useAccountsRoute() {
  const can = useCan();
  const picker = useBranchPicker();
  const [tab, setTab] = useState<AccountsTabId>("income");

  return {
    picker,
    branchId: picker.branchId,
    schoolId: picker.schoolId,
    noBranch: !picker.isLoading && !picker.branchId,
    tab,
    setTab: (value: string) => setTab(value as AccountsTabId),
    canAdd: can("expenses.add"),
  };
}
