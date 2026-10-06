import { useWatch } from "react-hook-form";
import { useServerForm } from "@/lib/use-server-form";
import { itemDefaults, itemSchema, toItemInput } from "./item-schemas";
import { useCreateItem } from "./items-api";

export function useItemForm(schoolId: string, onDone: () => void) {
  const create = useCreateItem();
  const { form, submit, submitting, formError } = useServerForm({
    schema: itemSchema,
    defaultValues: itemDefaults,
    onSubmit: (values) => create.mutateAsync(toItemInput(schoolId, values)),
    onSuccess: onDone,
    conflictField: "sku",
  });
  const saleable = useWatch({ control: form.control, name: "saleable" });

  return { form, submit, submitting, formError, saleable };
}
