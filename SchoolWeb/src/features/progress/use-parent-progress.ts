import { useState } from "react";
import { useActiveChild } from "@/features/auth/use-active-child";

export type ParentProgressTabId = "results" | "feedback" | "homework";

export function useParentProgress() {
  const child = useActiveChild();
  const [tab, setTab] = useState<ParentProgressTabId>("results");
  return {
    child,
    tab,
    setTab: (value: string) => setTab(value as ParentProgressTabId),
    caption: child ? [child.name, child.className, child.sectionName].filter(Boolean).join(" · ") : undefined,
  };
}
