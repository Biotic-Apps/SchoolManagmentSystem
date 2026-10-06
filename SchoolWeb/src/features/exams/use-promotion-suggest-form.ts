import type { BaseSyntheticEvent } from "react";
import { useWatch } from "react-hook-form";
import { useServerForm } from "@/lib/use-server-form";
import { suggestSchema, type SuggestValues } from "./promotion-schemas";
import { usePublishedExamOptions, useSuggestPromotions } from "./promotions-api";
import type { PromotionsTabState } from "./use-promotions-tab";

/** Suggest dialog: from / to session and the published exams the suggestion is based on. */
export function usePromotionSuggestForm(tab: PromotionsTabState) {
  const { scope } = tab;
  const suggest = useSuggestPromotions();

  const { form, submit, submitting, formError } = useServerForm<SuggestValues, unknown>({
    schema: suggestSchema,
    defaultValues: { fromSessionId: scope.sessionId ?? "", toSessionId: tab.toSessionId ?? "", examIds: [] },
    onSubmit: (values) =>
      suggest.mutateAsync({
        branchId: scope.branchId ?? "",
        fromSessionId: values.fromSessionId,
        toSessionId: values.toSessionId,
        examIds: values.examIds,
      }),
    onSuccess: (result, values) => {
      scope.setSessionId(values.fromSessionId);
      tab.setToSessionId(values.toSessionId);
      const jobId = (result as { jobId?: string | null } | null)?.jobId;
      tab.startJob(jobId, "Building promotion suggestions", "Suggestions are ready for review below.");
      tab.dialogs.suggest.close();
    },
  });

  const fromSessionId = useWatch({ control: form.control, name: "fromSessionId" });
  const exams = usePublishedExamOptions(scope.branchId, fromSessionId || null);

  // Exams picked before the from-session changed are dropped, so validation sees only current ones.
  const submitCurrent = (event?: BaseSyntheticEvent) => {
    const current = form.getValues("examIds").filter((id) => exams.options.some((option) => option.id === id));
    form.setValue("examIds", current);
    return submit(event);
  };

  return {
    form,
    submit: submitCurrent,
    submitting,
    formError,
    sessionOptions: scope.sessions.options,
    examOptions: exams.options,
    examsLoading: exams.isLoading,
  };
}
