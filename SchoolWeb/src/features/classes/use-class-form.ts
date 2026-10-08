import { useServerForm } from "@/lib/use-server-form";
import { useSaveClass } from "./api";
import { classSchema, toClassInput, type ClassFormValues } from "./schemas";
import type { SchoolClass } from "./types";

/** Add class by name only; it is appended after the last class. */
export function useClassForm(schoolId: string, levelOrder: number, onCreated: (created: SchoolClass) => void) {
  const save = useSaveClass();
  return useServerForm<ClassFormValues, SchoolClass>({
    schema: classSchema,
    defaultValues: { name: "" },
    onSubmit: async (values) => (await save.mutateAsync({ input: { ...toClassInput(values, levelOrder), schoolId } })).data,
    onSuccess: onCreated,
    conflictField: "name",
  });
}
