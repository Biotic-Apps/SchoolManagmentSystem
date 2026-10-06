import { useState } from "react";
import { useSessionOptions } from "@/features/sessions/api";

/** Session picker for a staff tab; follows the branch's active session until the user picks one. */
export function useStaffSession(branchId: string | null) {
  const sessions = useSessionOptions(branchId);
  const [chosenId, setSessionId] = useState<string | null>(null);
  const sessionId = chosenId && sessions.options.some((o) => o.id === chosenId) ? chosenId : sessions.activeId;
  return { options: sessions.options, sessionId, setSessionId, isLoading: sessions.isLoading };
}

export type StaffSessionPicker = ReturnType<typeof useStaffSession>;
