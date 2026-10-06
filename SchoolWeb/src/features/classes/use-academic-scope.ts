import { useState } from "react";
import { useBranchPicker } from "@/features/branches/use-branch-picker";
import { useSessionOptions } from "@/features/sessions/api";
import { useClassOptions } from "./api";

/**
 * Branch › session › class context for people & academics screens.
 * Branch defaults to the first in scope, session to the branch's active one; class is optional.
 */
export function useAcademicScope() {
  const picker = useBranchPicker();
  const sessions = useSessionOptions(picker.branchId);
  const classes = useClassOptions(picker.schoolId);
  const [chosenSession, setSessionId] = useState<string | null>(null);
  const [classId, setClassId] = useState<string | undefined>(undefined);

  const sessionId =
    chosenSession && sessions.options.some((option) => option.id === chosenSession) ? chosenSession : sessions.activeId;

  const setBranchId = (id: string) => {
    picker.setBranchId(id);
    setSessionId(null);
  };

  return {
    picker: { ...picker, setBranchId },
    branchId: picker.branchId,
    schoolId: picker.schoolId,
    branch: picker.branch,
    sessions,
    sessionId,
    setSessionId,
    classes,
    classId,
    setClassId,
    isLoading: picker.isLoading || sessions.isLoading,
    error: picker.error,
  };
}

export type AcademicScope = ReturnType<typeof useAcademicScope>;
