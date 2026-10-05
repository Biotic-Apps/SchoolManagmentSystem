import { useState } from "react";
import { useBranchPicker } from "@/features/branches/use-branch-picker";

export type ClassesTabId = "classes" | "sections" | "subjects" | "rooms";

export function useClassesPage() {
  const picker = useBranchPicker();
  const [tab, setTab] = useState<ClassesTabId>("classes");
  return { picker, tab, setTab: (value: string) => setTab(value as ClassesTabId) };
}
