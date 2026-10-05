import { useServerForm } from "@/lib/use-server-form";
import { useSaveClass } from "./api";
import { classFormDefaults, classSchema, toClassInput, type ClassFormValues } from "./schemas";
import type { SchoolClass } from "./types";

export function useClassForm(item: SchoolClass | null, schoolId: string, onDone: () => void) {
  const save = useSaveClass();
  return useServerForm<ClassFormValues>({
    schema: classSchema,
    defaultValues: classFormDefaults(item),
    onSubmit: (values) =>
      save.mutateAsync({ id: item?.id, input: { ...toClassInput(values), ...(item ? {} : { schoolId }) } }),
    onSuccess: onDone,
    conflictField: "name",
  });
}
