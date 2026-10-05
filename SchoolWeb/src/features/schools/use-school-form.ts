import { useServerForm } from "@/lib/use-server-form";
import { useSaveSchool } from "./api";
import { schoolFormDefaults, schoolSchema, toSchoolInput, type SchoolFormValues } from "./schemas";
import type { School } from "./types";

export function useSchoolForm(school: School | null, onDone: () => void) {
  const save = useSaveSchool();
  return useServerForm<SchoolFormValues>({
    schema: schoolSchema,
    defaultValues: schoolFormDefaults(school),
    onSubmit: (values) => save.mutateAsync({ id: school?.id, input: toSchoolInput(values, !!school) }),
    onSuccess: onDone,
    conflictField: "code",
  });
}
