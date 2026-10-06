import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { useAcademicScope } from "@/features/classes/use-academic-scope";
import type { TimetableTabId } from "./options";

export function useTimetableAdmin() {
  const scope = useAcademicScope();
  const can = useCan();
  const [tab, setTab] = useState<TimetableTabId>("section");
  return {
    scope,
    tab,
    setTab: (value: string) => setTab(value as TimetableTabId),
    goToBell: () => setTab("bell"),
    canEdit: can("timetable.edit"),
    canPublish: can("timetable.publish"),
  };
}
