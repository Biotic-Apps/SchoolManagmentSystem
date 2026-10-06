import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { useBranchPicker } from "@/features/branches/use-branch-picker";

export type InventoryTabId = "stock" | "items" | "movements" | "assets" | "purchasing" | "sales";

const TABS: { id: InventoryTabId; label: string }[] = [
  { id: "stock", label: "Stock" },
  { id: "items", label: "Items" },
  { id: "movements", label: "Movements" },
  { id: "assets", label: "Assets" },
  { id: "purchasing", label: "Purchasing" },
  { id: "sales", label: "Student sales" },
];

export function useInventoryRoute() {
  const can = useCan();
  const picker = useBranchPicker();
  const [tab, setTab] = useState<InventoryTabId>("stock");
  const tabs = TABS.filter((item) => item.id !== "sales" || can("fees.add"));

  return {
    picker,
    branchId: picker.branchId,
    schoolId: picker.schoolId,
    noBranch: !picker.isLoading && !picker.branchId,
    tabs,
    tab: tabs.some((item) => item.id === tab) ? tab : "stock",
    setTab: (value: string) => setTab(value as InventoryTabId),
  };
}
