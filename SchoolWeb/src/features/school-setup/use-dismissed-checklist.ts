import { useState } from "react";
import { readDismissed, writeDismissed } from "./dismissed-storage";

/** Per-user, per-branch "hide this card" flag kept in localStorage. */
export function useDismissedChecklist(userId: string | null, branchKey: string) {
  const [dismissed, setDismissed] = useState<string[]>(() => (userId ? readDismissed(userId) : []));

  const dismiss = () => {
    const next = [...new Set([...dismissed, branchKey])];
    setDismissed(next);
    if (userId) writeDismissed(userId, next);
  };

  return { isDismissed: dismissed.includes(branchKey), dismiss };
}
