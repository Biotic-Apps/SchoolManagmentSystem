import { useCan } from "@/features/auth/use-can";
import { useDialogState } from "@/lib/use-dialog-state";
import { expenseBalance } from "./amounts";
import { useFileUrl, useSubmitExpense } from "./expenses-api";
import { PAYABLE_STATUSES } from "./options";
import type { Expense } from "./types";

export function useExpenseDetail(expense: Expense | null) {
  const can = useCan();
  const submit = useSubmitExpense(expense?.id ?? "");
  const payment = useDialogState<true>();
  const inlineUrl = expense?.billFile?.url ?? expense?.billUrl ?? null;
  const fileId = expense?.billFileId ?? expense?.billFile?.id ?? null;
  const fileUrl = useFileUrl(fileId, !!expense && !inlineUrl);
  const balance = expense ? expenseBalance(expense) : 0;

  return {
    balance,
    billUrl: inlineUrl ?? fileUrl.data ?? null,
    hasBill: !!(inlineUrl || fileId),
    rights: {
      submit: !!expense && expense.status === "DRAFT" && can("expenses.add"),
      pay: !!expense && PAYABLE_STATUSES.has(expense.status) && balance > 0 && can("expenses.edit"),
    },
    submitting: submit.isPending,
    submitForApproval: () => submit.mutate(),
    payment,
  };
}

export type ExpenseDetail = ReturnType<typeof useExpenseDetail>;
