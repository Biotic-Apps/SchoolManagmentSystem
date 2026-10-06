import { useState } from "react";
import { useBranchPicker } from "@/features/branches/use-branch-picker";
import { todayIso } from "@/lib/dates";
import { useMissingDiaries } from "./api";

export function useMissingTab() {
  const picker = useBranchPicker();
  const [date, setDate] = useState(todayIso);
  const query = useMissingDiaries(picker.branchId, date);
  return { picker, date, setDate, query };
}
