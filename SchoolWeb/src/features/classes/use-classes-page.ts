import { useState } from "react";
import { useAcademicScope } from "./use-academic-scope";

export type ClassesTabId = "classes" | "catalogue";

export function useClassesPage() {
  const scope = useAcademicScope();
  const [tab, setTab] = useState<ClassesTabId>("classes");
  return { scope, tab, setTab: (value: string) => setTab(value as ClassesTabId) };
}
