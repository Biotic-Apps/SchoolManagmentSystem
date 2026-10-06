import { useServerForm } from "@/lib/use-server-form";
import { useRequestCorrection } from "./api";
import { correctionDefaults, correctionSchema, type CorrectionValues } from "./schemas";
import type { RegisterEntry } from "./types";

/** Locked registers change only through a principal-approved correction. */
export function useCorrectionForm(entry: RegisterEntry, onDone: () => void) {
  const correction = useRequestCorrection();
  return useServerForm<CorrectionValues>({
    schema: correctionSchema,
    defaultValues: correctionDefaults(entry.status),
    onSubmit: (values) =>
      correction.mutateAsync({ entryId: entry.entryId ?? "", newStatus: values.newStatus, reason: values.reason.trim() }),
    onSuccess: onDone,
  });
}
