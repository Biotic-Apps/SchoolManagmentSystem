import { useServerForm } from "@/lib/use-server-form";
import { paymentDefaults, paymentSchema, toPaymentInput } from "./expense-schemas";
import { useRecordExpensePayment } from "./expenses-api";

/** Partial payments allowed; the amount starts at the outstanding balance. */
export function usePaymentForm(expenseId: string, balanceMinor: number, onDone: () => void) {
  const record = useRecordExpensePayment(expenseId);
  return useServerForm({
    schema: paymentSchema(balanceMinor),
    defaultValues: paymentDefaults(balanceMinor),
    onSubmit: (values) => record.mutateAsync(toPaymentInput(values)),
    onSuccess: onDone,
  });
}
