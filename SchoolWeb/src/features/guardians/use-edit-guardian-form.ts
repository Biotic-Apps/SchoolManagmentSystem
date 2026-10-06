import { useServerForm } from "@/lib/use-server-form";
import { useUpdateGuardian } from "./api";
import { editGuardianDefaults, editGuardianSchema, toGuardianUpdate, type EditGuardianValues } from "./schemas";
import type { Guardian } from "./types";

export function useEditGuardianForm(guardian: Guardian, onDone: () => void) {
  const update = useUpdateGuardian(guardian.id);
  return useServerForm<EditGuardianValues>({
    schema: editGuardianSchema,
    defaultValues: editGuardianDefaults(guardian),
    onSubmit: (values) => update.mutateAsync(toGuardianUpdate(values)),
    onSuccess: onDone,
  });
}
