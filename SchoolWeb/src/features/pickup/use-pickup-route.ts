import { useState } from "react";
import { useBranchPicker } from "@/features/branches/use-branch-picker";
import { todayIso } from "@/lib/dates";

export type PickupTabId = "early-leave" | "departures" | "persons";

export function usePickupRoute() {
  const picker = useBranchPicker();
  const [date, setDate] = useState(todayIso);
  const [tab, setTab] = useState<PickupTabId>("early-leave");
  return {
    picker,
    branchId: picker.branchId,
    date,
    setDate,
    tab,
    setTab: (value: string) => setTab(value as PickupTabId),
    showDate: tab !== "persons",
  };
}
