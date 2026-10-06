import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { useClassOptions } from "@/features/classes/api";
import { useSessionOptions } from "@/features/sessions/api";
import { useDialogState } from "@/lib/use-dialog-state";
import { useApproveFeePlan, useFeeHeads, useFeePlans } from "./structure-api";
import type { FeePlan } from "./types";
import { useFeeHeadOptions } from "./use-fee-head-options";

interface StructureScope {
  branchId: string | null;
  schoolId: string | null;
}

/** Fee heads of the branch's school and fee plans of one session. */
export function useFeeStructureTab({ branchId, schoolId }: StructureScope) {
  const can = useCan();
  const sessions = useSessionOptions(branchId);
  const [chosenSessionId, setSessionId] = useState<string | null>(null);
  const sessionId = sessions.options.some((option) => option.id === chosenSessionId) ? chosenSessionId : sessions.activeId;

  const heads = useFeeHeads(schoolId);
  const plans = useFeePlans(branchId, sessionId);
  const classes = useClassOptions(schoolId);
  const approve = useApproveFeePlan();
  const headDialog = useDialogState<null>();
  const planDialog = useDialogState<FeePlan>();

  const headOptions = useFeeHeadOptions(schoolId);
  const classNames = new Map(classes.options.map((option) => [option.id, option.name]));

  return {
    branchId,
    schoolId,
    sessionId,
    setSessionId,
    sessionOptions: sessions.options,
    sessionsLoading: sessions.isLoading,
    heads,
    plans,
    headOptions,
    classOptions: classes.options,
    className: (plan: FeePlan) => plan.className ?? classNames.get(plan.classId) ?? "",
    canAdd: can("fees.add"),
    canEdit: can("fees.edit"),
    canApprove: can("fees.approve"),
    headDialog,
    planDialog,
    approvingId: approve.isPending ? approve.variables : undefined,
    approvePlan: (plan: FeePlan) => approve.mutate(plan.id),
  };
}

export type FeeStructureTab = ReturnType<typeof useFeeStructureTab>;
