import { todayIso } from "@/lib/dates";
import { toMoneyText } from "@/lib/money";
import { useServerForm } from "@/lib/use-server-form";
import { useRecordPayrollPayment } from "./runs-api";
import { paymentSchema, toPaymentInput } from "./schemas";
import type { PayrollLine } from "./types";

/** Salary payment for one line; the amount defaults to the outstanding balance. */
export function usePaymentForm(runId: string, line: PayrollLine, onDone: () => void) {
  const record = useRecordPayrollPayment(runId);
  return useServerForm({
    schema: paymentSchema,
    defaultValues: { amount: toMoneyText(Math.max(line.balanceMinor, 0)), method: "", reference: "", paidOn: todayIso() },
    onSubmit: (values) => record.mutateAsync(toPaymentInput(line.staffId, values)),
    onSuccess: onDone,
  });
}
