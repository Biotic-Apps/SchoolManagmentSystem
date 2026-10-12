import { useServerForm } from "@/lib/use-server-form";
import { useCreateIncomeCategory } from "./categories-api";
import { incomeCategoryDefaults, incomeCategorySchema, toIncomeCategoryInput } from "./income-schemas";

export function useIncomeCategoryForm(schoolId: string | null, onDone: () => void) {
  const create = useCreateIncomeCategory(schoolId);
  return useServerForm({
    schema: incomeCategorySchema,
    defaultValues: incomeCategoryDefaults,
    onSubmit: (values) => create.mutateAsync(toIncomeCategoryInput(values)),
    onSuccess: onDone,
    conflictField: "code",
  });
}
