import { useReportUnsaved } from "@/components/shared/UnsavedChangesGuard";
import { useServerForm } from "@/lib/use-server-form";
import { policySettingsSchema, policySettingsToValues, toPolicySettingsInput, type PolicySettingsValues } from "./policy-schemas";
import { useSavePolicySettings } from "./settings-api";
import type { PolicySettings } from "./types";

export function usePolicySettingsForm(schoolId: string, settings: PolicySettings) {
  const save = useSavePolicySettings(schoolId);
  const result = useServerForm<PolicySettingsValues, PolicySettings | null>({
    schema: policySettingsSchema,
    defaultValues: policySettingsToValues(settings),
    onSubmit: (values) => save.mutateAsync(toPolicySettingsInput(values, settings)),
    onSuccess: (saved, values) => result.form.reset(saved ? policySettingsToValues(saved) : values),
  });
  const dirty = result.form.formState.isDirty;
  useReportUnsaved(dirty);

  return { ...result, dirty, discard: () => result.form.reset() };
}
