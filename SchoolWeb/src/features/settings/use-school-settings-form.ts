import { useWatch } from "react-hook-form";
import { useReportUnsaved } from "@/components/shared/UnsavedChangesGuard";
import { useServerForm } from "@/lib/use-server-form";
import { schoolSettingsSchema, schoolSettingsToValues, toSchoolSettingsInput, type SchoolSettingsValues } from "./school-schemas";
import { useSaveSchoolSettings } from "./settings-api";
import type { SchoolSettings } from "./types";
import { usePrimaryColor } from "./use-primary-color";
import { useSchoolLogo } from "./use-school-logo";

export function useSchoolSettingsForm(schoolId: string, settings: SchoolSettings) {
  const save = useSaveSchoolSettings(schoolId);
  const result = useServerForm<SchoolSettingsValues, SchoolSettings | null>({
    schema: schoolSettingsSchema,
    defaultValues: schoolSettingsToValues(settings),
    onSubmit: (values) => save.mutateAsync(toSchoolSettingsInput(values)),
    onSuccess: (saved, values) => result.form.reset(saved ? schoolSettingsToValues(saved) : values),
  });
  const { form } = result;
  const dirty = form.formState.isDirty;
  useReportUnsaved(dirty);

  const logo = useSchoolLogo(form, settings);
  const color = usePrimaryColor(form);
  const displayName = useWatch({ control: form.control, name: "displayName" });

  return { ...result, dirty, discard: () => form.reset(), logo, color, displayName };
}
