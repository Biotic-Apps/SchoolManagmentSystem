import { toMinor } from "@/lib/money";
import { useServerForm } from "@/lib/use-server-form";
import { refundDefaults, refundSchema, toRefundInput, type RefundFormValues } from "./payment-schemas";
import { useRequestRefund } from "./payments-api";
import type { Payment } from "./types";

/** Refund request against one payment; it waits for approval (REFUND). */
export function useRefundForm(payment: Payment, onDone: () => void) {
  const refund = useRequestRefund();
  const { form, submit, submitting, formError } = useServerForm<RefundFormValues>({
    schema: refundSchema.refine((values) => (toMinor(values.amount) ?? 0) <= payment.amountMinor, {
      path: ["amount"],
      message: "A refund can't be more than the payment",
    }),
    defaultValues: refundDefaults,
    onSubmit: (values) => refund.mutateAsync(toRefundInput(payment.id, values)),
    onSuccess: onDone,
  });
  return { form, submit, submitting, formError };
}
