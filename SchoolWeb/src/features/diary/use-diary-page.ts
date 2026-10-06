import { useState } from "react";
import { useSession } from "@/features/auth/session-context";
import { useCan } from "@/features/auth/use-can";
import { SUPERVISOR_ROLES } from "./options";

export type DiaryTabId = "diary" | "moderation" | "missing";

export function useDiaryPage() {
  const can = useCan();
  const role = useSession().session?.activeRole ?? "";
  const [tab, setTab] = useState<DiaryTabId>("diary");
  const canModerate = can("diary.approve");
  return {
    tab,
    setTab: (value: string) => setTab(value as DiaryTabId),
    canModerate,
    canSeeMissing: canModerate || SUPERVISOR_ROLES.includes(role),
  };
}
