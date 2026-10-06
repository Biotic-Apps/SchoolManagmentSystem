import { useRequestContactChange } from "@/features/guardians/child-links-api";
import { useServerForm } from "@/lib/use-server-form";
import {
  contactChangeSchema,
  EMPTY_CONTACT_CHANGE,
  toContactChangeInput,
  type ContactChangeValues,
} from "./parent-schemas";

/** PARENT: asks the school to replace the verified contact; it applies after approval. */
export function useContactChangeForm() {
  const request = useRequestContactChange();
  const result = useServerForm<ContactChangeValues>({
    schema: contactChangeSchema,
    defaultValues: EMPTY_CONTACT_CHANGE,
    onSubmit: (values) => request.mutateAsync(toContactChangeInput(values)),
    onSuccess: () => result.form.reset(EMPTY_CONTACT_CHANGE),
  });
  return { ...result, sent: request.isSuccess };
}
