import { useServerForm } from "@/lib/use-server-form";
import { subjectFormDefaults, subjectSchema, toSubjectInput, type SubjectFormValues } from "./schemas";
import { useSaveSubject } from "./subjects-api";
import type { Subject } from "./types";

export function useSubjectForm(item: Subject | null, schoolId: string, onDone: () => void) {
  const save = useSaveSubject();
  return useServerForm<SubjectFormValues>({
    schema: subjectSchema,
    defaultValues: subjectFormDefaults(item),
    onSubmit: (values) =>
      save.mutateAsync({ id: item?.id, input: { ...toSubjectInput(values), ...(item ? {} : { schoolId }) } }),
    onSuccess: onDone,
    conflictField: "code",
  });
}
