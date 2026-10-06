import { z } from "zod";
import { moneyText, toMinor } from "@/lib/money";
import { todayIso } from "@/lib/dates";
import { blankToUndefined, isoDate, optionalText, requiredText } from "@/lib/validation";
import { REFERENCE_METHODS } from "./payment-options";
import type { PaymentInput, RefundInput } from "./payments-api";
import type { PaymentMethod } from "./types";

export const paymentSchema = z
  .object({
    studentId: z.string().min(1, "Choose a student"),
    amount: moneyText("the amount"),
    method: z.string().min(1, "Choose how it was paid"),
    reference: optionalText(80),
    receivedOn: isoDate,
    manual: z.boolean(),
    allocations: z.array(
      z.object({ invoiceId: z.string(), amount: moneyText("the amount", { required: false, allowZero: true }) }),
    ),
  })
  .superRefine((values, ctx) => {
    if (REFERENCE_METHODS.has(values.method) && !values.reference.trim()) {
      ctx.addIssue({ code: "custom", path: ["reference"], message: "Enter the bank or cheque reference" });
    }
    if (values.receivedOn > todayIso()) {
      ctx.addIssue({ code: "custom", path: ["receivedOn"], message: "The date can't be in the future" });
    }
    if (values.manual && manualTotal(values.allocations) > (toMinor(values.amount) ?? 0)) {
      ctx.addIssue({ code: "custom", path: ["amount"], message: "The allocated amounts add up to more than the payment" });
    }
  });
export type PaymentFormValues = z.infer<typeof paymentSchema>;

export const paymentDefaults = (studentId?: string): PaymentFormValues => ({
  studentId: studentId ?? "",
  amount: "",
  method: "CASH",
  reference: "",
  receivedOn: todayIso(),
  manual: false,
  allocations: [],
});

export function manualTotal(allocations: PaymentFormValues["allocations"]): number {
  return allocations.reduce((sum, row) => sum + (toMinor(row.amount) ?? 0), 0);
}

export function toPaymentInput(
  values: PaymentFormValues,
  clientRequestId: string,
  allocations?: { invoiceId: string; amountMinor: number }[],
): PaymentInput {
  return {
    studentId: values.studentId,
    amountMinor: toMinor(values.amount) ?? 0,
    method: values.method as PaymentMethod,
    reference: blankToUndefined(values.reference),
    receivedOn: values.receivedOn,
    allocations: allocations?.filter((row) => row.amountMinor > 0),
    clientRequestId,
  };
}

export const refundSchema = z.object({
  amount: moneyText("the refund amount"),
  method: z.string().min(1, "Choose how it is paid back"),
  reason: requiredText("the reason", 500),
});
export type RefundFormValues = z.infer<typeof refundSchema>;

export const refundDefaults: RefundFormValues = { amount: "", method: "CASH", reason: "" };

export function toRefundInput(paymentId: string, values: RefundFormValues): RefundInput {
  return { paymentId, amountMinor: toMinor(values.amount) ?? 0, method: values.method, reason: values.reason.trim() };
}
