import { useState } from "react";
import { labelFor } from "@/config/navigation";
import { useSession } from "@/features/auth/session-context";
import { useCan } from "@/features/auth/use-can";
import { useAcademicScope } from "@/features/classes/use-academic-scope";
import { useDialogState } from "@/lib/use-dialog-state";

export type StudentsTabId = "students" | "transfers";

export function useStudentsPage() {
  const { session } = useSession();
  const can = useCan();
  const scope = useAcademicScope();
  const [tab, setTab] = useState<StudentsTabId>("students");
  const register = useDialogState<true>();
  const printCards = useDialogState<true>();

  return {
    scope,
    title: labelFor(session?.activeRole, "students"),
    tab,
    setTab: (value: string) => setTab(value as StudentsTabId),
    ready: !!scope.branchId && !!scope.sessionId,
    noBranch: !scope.isLoading && !scope.error && !scope.branchId,
    noSession: !scope.isLoading && !!scope.branchId && !scope.sessionId,
    canAdd: can("students.add") && !!scope.sessionId,
    register,
    canPrintCards: can("students.edit") && !!scope.sessionId,
    printCards,
  };
}
