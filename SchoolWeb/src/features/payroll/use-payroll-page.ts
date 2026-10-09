import { useState } from "react";
import { useBranchPicker } from "@/features/branches/use-branch-picker";

export type PayrollTabId = "runs" | "structures" | "overtime" | "adjustments" | "rules";

export function usePayrollPage() {
  const picker = useBranchPicker();
  const [tab, setTab] = useState<PayrollTabId>("runs");
  return { picker, tab, setTab: (value: string) => setTab(value as PayrollTabId) };
}
