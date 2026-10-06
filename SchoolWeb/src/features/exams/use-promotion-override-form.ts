import { useWatch } from "react-hook-form";
import { useSectionOptions } from "@/features/classes/sections-api";
import { blankToUndefined } from "@/lib/validation";
import { useServerForm } from "@/lib/use-server-form";
import { overrideSchema, type OverrideValues } from "./promotion-schemas";
import { useOverridePromotion } from "./promotions-api";
import type { PromotionDecision, PromotionRow } from "./types";

/** Class the student sits in next session for a decision (repeaters stay in their class). */
function targetClassId(row: PromotionRow, decision: string): string | null {
  if (decision === "REPEAT") return row.fromClass.id;
  return row.toClass?.id ?? null;
}

/** Override one suggestion: decision, target section in the next session, reason when it differs. */
export function usePromotionOverrideForm(
  row: PromotionRow,
  branchId: string | null,
  toSessionId: string | null,
  onDone: () => void,
) {
  const override = useOverridePromotion(row.id);
  const { form, submit, submitting, formError } = useServerForm<OverrideValues, unknown>({
    schema: overrideSchema(row.suggested),
    defaultValues: { decision: row.decision, toSectionId: row.toSection?.id ?? "", reason: row.reason ?? "" },
    onSubmit: (values) =>
      override.mutateAsync({
        decision: values.decision as PromotionDecision,
        toSectionId: values.decision === "GRADUATE" ? undefined : blankToUndefined(values.toSectionId),
        reason: blankToUndefined(values.reason),
      }),
    onSuccess: onDone,
  });

  const decision = useWatch({ control: form.control, name: "decision" });
  const classId = targetClassId(row, decision);
  const sections = useSectionOptions(branchId, toSessionId, classId);

  return {
    form,
    submit,
    submitting,
    formError,
    showSection: decision !== "GRADUATE",
    sectionOptions: sections.options,
    sectionsLoading: sections.isLoading,
    hasToSession: !!toSessionId,
    reasonRequired: decision !== row.suggested,
  };
}
