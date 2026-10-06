import { useState } from "react";
import { useCan } from "@/features/auth/use-can";

export type ExamsTabId = "exams" | "grading" | "promotions";

export function useExamsPage() {
  const can = useCan();
  const [tab, setTab] = useState<ExamsTabId>("exams");
  return {
    tab,
    setTab: (value: string) => setTab(value as ExamsTabId),
    canPromote: can("exams.approve"),
  };
}
