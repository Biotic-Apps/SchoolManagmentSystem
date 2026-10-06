import { useServerForm } from "@/lib/use-server-form";
import { useRequestHealthChange, useSaveHealthProfile } from "./api";
import {
  healthProfileDefaults,
  healthProfileSchema,
  toHealthProfileInput,
  type HealthProfileValues,
} from "./profile-schemas";
import type { HealthProfile } from "./types";
import type { HealthEditorMode } from "./use-health-tab";

/** Same editor for both: staff save the profile directly, parents send it as a change request. */
export function useHealthProfileForm(
  studentId: string,
  profile: HealthProfile | null,
  mode: HealthEditorMode,
  onDone: () => void,
) {
  const save = useSaveHealthProfile(studentId);
  const request = useRequestHealthChange(studentId);
  return useServerForm<HealthProfileValues>({
    schema: healthProfileSchema,
    defaultValues: healthProfileDefaults(profile),
    onSubmit: (values) => {
      const input = toHealthProfileInput(values);
      return mode === "edit" ? save.mutateAsync(input) : request.mutateAsync(input);
    },
    onSuccess: onDone,
  });
}
