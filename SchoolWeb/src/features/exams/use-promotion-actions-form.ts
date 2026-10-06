import { todayIso } from "@/lib/dates";
import { blankToUndefined } from "@/lib/validation";
import { useServerForm } from "@/lib/use-server-form";
import { applySchema, confirmSchema, type ApplyValues, type ConfirmValues } from "./promotion-schemas";
import { useApplyPromotions, useConfirmPromotions } from "./promotions-api";
import type { PromotionsTabState } from "./use-promotions-tab";

/** Principal: send suggestions (all or one class) for PROMOTION approval. */
export function usePromotionConfirmForm(tab: PromotionsTabState) {
  const confirm = useConfirmPromotions();
  return useServerForm<ConfirmValues, unknown>({
    schema: confirmSchema,
    defaultValues: { classId: tab.scope.classId ?? "" },
    onSubmit: (values) =>
      confirm.mutateAsync({
        branchId: tab.scope.branchId ?? "",
        fromSessionId: tab.scope.sessionId ?? "",
        classId: blankToUndefined(values.classId),
      }),
    onSuccess: () => tab.dialogs.confirm.close(),
  });
}

/** After approval: create next-session enrollments from the effective date. */
export function usePromotionApplyForm(tab: PromotionsTabState) {
  const apply = useApplyPromotions();
  return useServerForm<ApplyValues, unknown>({
    schema: applySchema,
    defaultValues: { effectiveDate: todayIso() },
    onSubmit: (values) =>
      apply.mutateAsync({
        branchId: tab.scope.branchId ?? "",
        fromSessionId: tab.scope.sessionId ?? "",
        effectiveDate: values.effectiveDate,
      }),
    onSuccess: (result) => {
      const jobId = (result as { jobId?: string | null } | null)?.jobId;
      tab.startJob(jobId, "Applying promotions", "Promotions applied. Next-session enrollments are created.");
      tab.dialogs.apply.close();
    },
  });
}
