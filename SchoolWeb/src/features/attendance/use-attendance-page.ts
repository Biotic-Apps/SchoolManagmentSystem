import { useState } from "react";
import { useIsParent } from "@/features/auth/use-active-child";
import { useSession } from "@/features/auth/session-context";
import { useCan } from "@/features/auth/use-can";
import { useSectionScope } from "@/features/classes/use-section-scope";
import { todayIso } from "@/lib/dates";
import { SUPERVISOR_ROLES } from "./options";

export type AttendanceView = "child" | "school";

/** Parents get their child's attendance and leave; everyone else gets the staff tabs. */
export function useAttendanceView(): AttendanceView {
  return useIsParent() ? "child" : "school";
}

export type AttendanceTabId = "register" | "summary" | "staff" | "leave";

/**
 * Section scope and date live here so "Not submitted" in the branch summary can jump
 * straight to that section's register.
 */
export function useAttendancePage() {
  const can = useCan();
  const role = useSession().session?.activeRole ?? "";
  const sectionScope = useSectionScope();
  const [date, setDate] = useState(todayIso());

  const supervisor = SUPERVISOR_ROLES.has(role) || can("attendance.approve");
  const tabs = {
    register: true,
    summary: supervisor,
    staff: can("attendance.approve"),
    leave: role !== "HELPER",
  };
  const fallback: AttendanceTabId = supervisor ? "summary" : "register";
  const [chosen, setTab] = useState<AttendanceTabId | null>(null);
  const tab = chosen && tabs[chosen] ? chosen : fallback;

  const openRegister = (sectionId: string) => {
    sectionScope.setSectionId(sectionId);
    setTab("register");
  };

  return {
    tab,
    tabs,
    setTab: (value: string) => setTab(value as AttendanceTabId),
    sectionScope,
    date,
    setDate,
    openRegister,
  };
}

export type AttendancePageState = ReturnType<typeof useAttendancePage>;
