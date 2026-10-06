import { useServerForm } from "@/lib/use-server-form";
import { useSaveFeePlan } from "./structure-api";
import { feePlanDefaults, feePlanSchema, toFeePlanInput, type FeePlanFormValues } from "./structure-schemas";
import type { FeePlan } from "./types";

interface FeePlanScope {
  branchId: string;
  sessionId: string;
}

export function useFeePlanForm(plan: FeePlan | null, scope: FeePlanScope, onDone: () => void) {
  const save = useSaveFeePlan();
  return useServerForm<FeePlanFormValues>({
    schema: feePlanSchema,
    defaultValues: feePlanDefaults(plan),
    onSubmit: (values) => save.mutateAsync({ id: plan?.id, input: toFeePlanInput(values, scope) }),
    onSuccess: onDone,
  });
}
