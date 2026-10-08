import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCan } from "@/features/auth/use-can";
import { useAcademicScope } from "@/features/classes/use-academic-scope";
import type { TimetableTabId } from "./options";

/** Admin timetable: branch/section can come from a link (?branchId=&sectionId=), e.g. Class setup's "Open timetable". */
export function useTimetableAdmin() {
  const params = useSearchParams();
  const scope = useAcademicScope({ branchId: params.get("branchId") });
  const can = useCan();
  const [tab, setTab] = useState<TimetableTabId>("section");
  return {
    scope,
    initialSectionId: params.get("sectionId"),
    tab,
    setTab: (value: string) => setTab(value as TimetableTabId),
    goToBell: () => setTab("bell"),
    canEdit: can("timetable.edit"),
    canPublish: can("timetable.publish"),
  };
}
