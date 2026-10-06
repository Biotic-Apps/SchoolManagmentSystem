import { useState } from "react";
import { useActiveChild } from "@/features/auth/use-active-child";
import { useStudent } from "./api";
import type { StudentTabId } from "./use-student-detail";

/** PARENT: read-only profile of the child picked in the Topbar switcher. */
export function useChildProfile() {
  const child = useActiveChild();
  const query = useStudent(child?.id ?? null);
  const [tab, setTab] = useState<StudentTabId>("profile");

  return {
    child,
    query,
    student: query.data ?? null,
    tab,
    setTab: (value: string) => setTab(value as StudentTabId),
  };
}
