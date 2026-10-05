import { useServerForm } from "@/lib/use-server-form";
import { useSaveTerm } from "./api";
import { termFormDefaults, termSchema, toTermInput, type TermFormValues } from "./schemas";
import type { AcademicSession, Term } from "./types";

export function useTermForm(session: AcademicSession, term: Term | null, allTerms: Term[], onDone: () => void) {
  const save = useSaveTerm(session.id);
  const siblings = allTerms.filter((item) => item.id !== term?.id);
  return useServerForm<TermFormValues>({
    schema: termSchema(session, siblings),
    defaultValues: termFormDefaults(term),
    onSubmit: (values) => save.mutateAsync({ id: term?.id, input: toTermInput(values) }),
    onSuccess: onDone,
  });
}
