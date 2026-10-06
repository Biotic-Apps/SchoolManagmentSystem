import { useWatch } from "react-hook-form";
import { useServerForm } from "@/lib/use-server-form";
import { expenseDefaults, expenseSchema, toExpenseInput } from "./expense-schemas";
import { useCreateExpense } from "./expenses-api";
import type { Expense } from "./types";

export function useExpenseForm(branchId: string, onSaved: (expense: Expense) => void) {
  const create = useCreateExpense();
  const { form, submit, submitting, formError } = useServerForm({
    schema: expenseSchema,
    defaultValues: expenseDefaults(),
    onSubmit: (values) => create.mutateAsync(toExpenseInput(branchId, values)),
    onSuccess: onSaved,
  });
  const recurring = useWatch({ control: form.control, name: "recurringMonthly" });

  return { form, submit, submitting, formError, recurring };
}
