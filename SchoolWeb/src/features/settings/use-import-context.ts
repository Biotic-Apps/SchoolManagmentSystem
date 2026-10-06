import { useMemo, useState } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { useActiveBranches } from "@/features/branches/api";
import { useSessionOptions } from "@/features/sessions/api";
import type { ImportKind } from "./import-types";

/** Branch (scoped to the school), academic session (defaults to the active one) and import kind. */
export function useImportContext(schoolId: string) {
  const branches = useActiveBranches(schoolId);
  const [chosenBranchId, setBranchId] = useState<string | null>(null);
  const [chosenSession, setChosenSession] = useState<{ branchId: string; sessionId: string } | null>(null);
  const [kind, setKind] = useState<ImportKind>("STUDENTS");

  const branchOptions: Option[] = useMemo(
    () => branches.branches.map((branch) => ({ id: branch.id, name: branch.name })),
    [branches.branches],
  );
  const branchId = branchOptions.find((item) => item.id === chosenBranchId)?.id ?? branchOptions[0]?.id ?? null;

  const sessions = useSessionOptions(branchId);
  const chosenSessionId =
    chosenSession?.branchId === branchId && sessions.options.some((item) => item.id === chosenSession.sessionId)
      ? chosenSession.sessionId
      : null;
  const sessionId = chosenSessionId ?? sessions.activeId;

  return {
    branchId,
    branchOptions,
    setBranchId,
    branchesLoading: branches.isLoading,
    branchesError: branches.error,
    sessionId,
    sessionOptions: sessions.options,
    sessionsLoading: sessions.isLoading,
    setSessionId: (id: string) => {
      if (branchId) setChosenSession({ branchId, sessionId: id });
    },
    kind,
    setKind,
    ready: !!branchId && !!sessionId,
  };
}

export type ImportContextState = ReturnType<typeof useImportContext>;
