import { useMemo, useState } from "react";
import { useSession } from "@/features/auth/session-context";
import { useCan } from "@/features/auth/use-can";
import { useAcademicScope } from "@/features/classes/use-academic-scope";
import { toast } from "@/lib/toast";
import { useDialogState } from "@/lib/use-dialog-state";
import { promotionColumns } from "./promotion-columns";
import { DECISIONS, PROMOTION_MANAGER_ROLES } from "./promotion-options";
import { usePromotions } from "./promotions-api";
import type { PromotionDecision, PromotionRow } from "./types";

interface Job {
  id: string;
  label: string;
  doneLabel: string;
}

/** Next session after the given one (by start date), as the default promotion target. */
function nextSessionId(sessions: { id: string; startDate: string }[], fromId: string | null): string | null {
  const from = sessions.find((session) => session.id === fromId);
  if (!from) return null;
  const later = sessions
    .filter((session) => session.startDate > from.startDate)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  return later[0]?.id ?? null;
}

/** Promotion review for one branch and session: suggest, override, confirm for approval, apply. */
export function usePromotionsTab() {
  const can = useCan();
  const role = useSession().session?.activeRole ?? "";
  const scope = useAcademicScope();
  const [chosenTo, setToSessionId] = useState<string | null>(null);
  const [decision, setDecision] = useState<string | undefined>(undefined);
  const [job, setJob] = useState<Job | null>(null);
  const suggest = useDialogState<void>();
  const override = useDialogState<PromotionRow>();
  const confirm = useDialogState<void>();
  const apply = useDialogState<void>();

  const sessions = scope.sessions.sessions;
  const toSessionId =
    chosenTo && chosenTo !== scope.sessionId && sessions.some((session) => session.id === chosenTo)
      ? chosenTo
      : nextSessionId(sessions, scope.sessionId);
  const toSessionOptions = scope.sessions.options.filter((option) => option.id !== scope.sessionId);

  const ready = !!scope.branchId && !!scope.sessionId;
  const query = usePromotions(
    { branchId: scope.branchId, fromSessionId: scope.sessionId, classId: scope.classId },
    ready,
  );
  const allRows = useMemo(() => query.data ?? [], [query.data]);
  const rows = useMemo(
    () => (decision ? allRows.filter((row) => row.decision === decision) : allRows),
    [allRows, decision],
  );

  const counts = useMemo(() => {
    const byDecision = Object.fromEntries(DECISIONS.map((item) => [item, 0])) as Record<PromotionDecision, number>;
    for (const row of allRows) byDecision[row.decision] = (byDecision[row.decision] ?? 0) + 1;
    return {
      byDecision,
      confirmed: allRows.filter((row) => row.status === "CONFIRMED").length,
      suggested: allRows.filter((row) => row.status === "SUGGESTED").length,
    };
  }, [allRows]);

  const canSuggest = can("exams.approve");
  const isManager = PROMOTION_MANAGER_ROLES.has(role);
  const columns = useMemo(
    () => promotionColumns({ onOverride: canSuggest ? override.show : undefined }),
    [canSuggest, override.show],
  );

  return {
    scope,
    toSessionId,
    setToSessionId,
    toSessionOptions,
    decision,
    setDecision,
    resetFilters: () => {
      scope.setClassId(undefined);
      setDecision(undefined);
    },
    ready,
    query,
    rows,
    counts,
    columns,
    job,
    startJob: (id: string | null | undefined, label: string, doneLabel: string) => {
      setJob(id ? { id, label, doneLabel } : null);
      if (!id) toast.success(doneLabel);
    },
    canSuggest,
    canConfirm: isManager && counts.suggested > 0,
    canApply: isManager && counts.confirmed > 0,
    isManager,
    dialogs: { suggest, override, confirm, apply },
  };
}

export type PromotionsTabState = ReturnType<typeof usePromotionsTab>;
