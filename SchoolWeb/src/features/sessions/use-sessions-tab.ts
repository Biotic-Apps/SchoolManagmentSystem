import { useCallback, useMemo, useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { useDialogState } from "@/lib/use-dialog-state";
import { useAcademicSessions } from "./api";
import { sessionColumns, type SessionTransition } from "./session-columns";
import type { AcademicSession } from "./types";

export interface TransitionTarget {
  session: AcademicSession;
  action: SessionTransition;
}

export function useSessionsTab(branchId: string | null) {
  const can = useCan();
  const query = useAcademicSessions(branchId);
  const form = useDialogState<AcademicSession>();
  const terms = useDialogState<AcademicSession>();
  const [transition, setTransition] = useState<TransitionTarget | null>(null);

  const canAdd = can("sessions.add");
  const canEdit = can("sessions.edit");

  const onTransition = useCallback(
    (session: AcademicSession, action: SessionTransition) => setTransition({ session, action }),
    [],
  );

  const columns = useMemo(
    () =>
      sessionColumns({
        onTerms: terms.show,
        onEdit: canEdit ? form.show : undefined,
        onTransition: canEdit ? onTransition : undefined,
      }),
    [terms.show, form.show, onTransition, canEdit],
  );

  return {
    query,
    rows: query.data?.data,
    columns,
    canAdd: canAdd && !!branchId,
    canEdit,
    form,
    terms,
    transition,
    closeTransition: () => setTransition(null),
  };
}
