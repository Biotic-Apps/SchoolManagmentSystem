import { useServerForm } from "@/lib/use-server-form";
import { useSaveAcademicSession } from "./api";
import { sessionFormDefaults, sessionSchema, toSessionInput, type SessionFormValues } from "./schemas";
import type { AcademicSession } from "./types";

export function useSessionForm(session: AcademicSession | null, branchId: string | null, onDone: () => void) {
  const save = useSaveAcademicSession();
  return useServerForm<SessionFormValues>({
    schema: sessionSchema,
    defaultValues: sessionFormDefaults(session),
    onSubmit: (values) =>
      save.mutateAsync({ id: session?.id, input: toSessionInput(values, session ? null : branchId) }),
    onSuccess: onDone,
    conflictField: "name",
  });
}
