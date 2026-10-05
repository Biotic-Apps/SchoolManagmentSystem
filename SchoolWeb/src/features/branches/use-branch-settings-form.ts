import { useServerForm } from "@/lib/use-server-form";
import { useSaveBranchSettings } from "./api";
import { branchSettingsSchema, settingsToValues, valuesToSettings, type BranchSettingsValues } from "./settings-schema";
import type { BranchSettings } from "./types";

export function useBranchSettingsForm(branchId: string, settings: BranchSettings, onDone: () => void) {
  const save = useSaveBranchSettings(branchId);
  return useServerForm<BranchSettingsValues>({
    schema: branchSettingsSchema,
    defaultValues: settingsToValues(settings),
    onSubmit: (values) => save.mutateAsync(valuesToSettings(values)),
    onSuccess: onDone,
  });
}
