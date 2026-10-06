import { useState } from "react";
import { useGuardedAction } from "@/components/shared/UnsavedChangesGuard";
import { useSectionScope } from "@/features/classes/use-section-scope";

export type ProgressTabId = "feedback" | "homework";

/** Staff: one section scope shared by the feedback and homework tabs. */
export function useProgressPage() {
  const scope = useSectionScope();
  const guard = useGuardedAction();
  const [tab, setTab] = useState<ProgressTabId>("feedback");
  return {
    scope,
    tab,
    setTab: (value: string) => guard(() => setTab(value as ProgressTabId)),
  };
}
