import { useState } from "react";
import { useIsParent } from "@/features/auth/use-active-child";
import { useAcademicScope } from "@/features/classes/use-academic-scope";

export type SyllabusView = "child" | "school";

/** Parents get their child's read-only syllabus; everyone else gets the management tabs. */
export function useSyllabusView(): SyllabusView {
  return useIsParent() ? "child" : "school";
}

export type SyllabusTabId = "books" | "plans" | "coverage";

export function useSyllabusPage() {
  const scope = useAcademicScope();
  const [tab, setTab] = useState<SyllabusTabId>("books");
  const { branchId, sessionId, classId } = scope;
  return {
    scope,
    tab,
    setTab: (value: string) => setTab(value as SyllabusTabId),
    tabScope: branchId ? { branchId, sessionId, classId } : null,
    // Remounts the tabs so their pickers reset when the scope changes.
    scopeKey: `${branchId}:${sessionId}:${classId ?? "all"}`,
  };
}
