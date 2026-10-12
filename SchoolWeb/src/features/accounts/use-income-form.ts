import { useServerForm } from "@/lib/use-server-form";
import { incomeDefaults, incomeSchema, toIncomeInput } from "./income-schemas";
import { useCreateIncome } from "./income-api";
import type { Income } from "./types";

export function useIncomeForm(branchId: string, onSaved: (income: Income) => void) {
  const create = useCreateIncome();
  const { form, submit, submitting, formError } = useServerForm({
    schema: incomeSchema,
    defaultValues: incomeDefaults(),
    onSubmit: (values) => create.mutateAsync(toIncomeInput(branchId, values)),
    onSuccess: onSaved,
  });

  return { form, submit, submitting, formError };
}
