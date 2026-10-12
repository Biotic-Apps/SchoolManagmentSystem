import { useServerForm } from "@/lib/use-server-form";
import { useGenerateHrLetter } from "./api";
import { generateLetterDefaults, generateLetterSchema, toGenerateInput } from "./schemas";
import type { HrLetter } from "./types";

export function useGenerateForm(staffId: string, onSaved: (letter: HrLetter) => void) {
  const generate = useGenerateHrLetter(staffId);

  const { form, submit, submitting, formError } = useServerForm({
    schema: generateLetterSchema,
    defaultValues: generateLetterDefaults(),
    onSubmit: (values) => generate.mutateAsync(toGenerateInput(values)),
    onSuccess: onSaved,
  });

  return { form, submit, submitting, formError };
}
