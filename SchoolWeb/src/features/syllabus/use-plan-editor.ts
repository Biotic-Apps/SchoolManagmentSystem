import { useServerForm } from "@/lib/use-server-form";
import { useSavePlanDraft } from "./api";
import { planDefaults, planSchema, toPlanInput, type PlanValues } from "./schemas";
import type { SyllabusPlan } from "./types";

export interface PlanScope {
  sectionId: string;
  subjectId: string;
  sessionId: string;
}

export function usePlanEditor(scope: PlanScope, source: SyllabusPlan | null, onDone: () => void) {
  const save = useSavePlanDraft();
  return useServerForm<PlanValues>({
    schema: planSchema,
    defaultValues: planDefaults(source),
    onSubmit: (values) => save.mutateAsync(toPlanInput(values, scope)),
    onSuccess: onDone,
  });
}
