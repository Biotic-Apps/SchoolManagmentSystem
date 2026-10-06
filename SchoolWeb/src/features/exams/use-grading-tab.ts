import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { useAcademicScope } from "@/features/classes/use-academic-scope";
import { useDialogState } from "@/lib/use-dialog-state";
import { useApproveGradingScheme, useGradingSchemes } from "./grading-api";
import type { GradingScheme } from "./types";

/** Grading schemes of the picked school and session. */
export function useGradingTab() {
  const can = useCan();
  const scope = useAcademicScope();
  const editor = useDialogState<GradingScheme>();
  const approve = useApproveGradingScheme();
  // Schemes the API refused to change (used by an exam with approved results).
  const [lockedIds, setLockedIds] = useState<string[]>([]);
  const ready = !!scope.schoolId && !!scope.sessionId;
  const query = useGradingSchemes({ schoolId: scope.schoolId, sessionId: scope.sessionId }, ready);

  return {
    scope,
    query,
    schemes: query.data ?? [],
    editor,
    canAdd: can("exams.add") && ready,
    canEdit: can("exams.edit"),
    canApprove: can("exams.approve"),
    isLocked: (scheme: GradingScheme) => !!scheme.locked || lockedIds.includes(scheme.id),
    markLocked: (id: string) => setLockedIds((current) => [...current, id]),
    approve: (id: string) => approve.mutate(id),
  };
}

export type GradingTabState = ReturnType<typeof useGradingTab>;
