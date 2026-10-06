import { z } from "zod";
import { todayIso } from "@/lib/dates";
import { moneyText, toMinor, toMoneyText } from "@/lib/money";
import { blankToUndefined, isoDate, optionalIsoDate, optionalText, requiredText } from "@/lib/validation";
import type { ExpenseInput, ExpensePaymentInput, ExpensePaymentMethod } from "./types";

export const expenseSchema = z
  .object({
    categoryId: z.string().min(1, "Choose a category"),
    vendorId: z.string(),
    title: requiredText("a title", 150),
    amount: moneyText("the amount"),
    billDate: isoDate,
    dueDate: optionalIsoDate,
    billFileId: z.string(),
    recurringMonthly: z.boolean(),
    untilMonth: z.string(),
    notes: optionalText(1000),
  })
  .refine((values) => !values.dueDate || values.dueDate >= values.billDate, {
    path: ["dueDate"],
    message: "Due date can't be before the bill date",
  });
export type ExpenseFormValues = z.infer<typeof expenseSchema>;

export const expenseDefaults = (): ExpenseFormValues => ({
  categoryId: "",
  vendorId: "",
  title: "",
  amount: "",
  billDate: todayIso(),
  dueDate: "",
  billFileId: "",
  recurringMonthly: false,
  untilMonth: "",
  notes: "",
});

export function toExpenseInput(branchId: string, values: ExpenseFormValues): ExpenseInput {
  const untilMonth = blankToUndefined(values.untilMonth);
  return {
    branchId,
    categoryId: values.categoryId,
    vendorId: blankToUndefined(values.vendorId),
    title: values.title.trim(),
    amountMinor: toMinor(values.amount) ?? 0,
    billDate: values.billDate,
    dueDate: blankToUndefined(values.dueDate),
    billFileId: blankToUndefined(values.billFileId),
    recurring: values.recurringMonthly ? { monthly: true, ...(untilMonth ? { untilMonth } : {}) } : undefined,
    notes: blankToUndefined(values.notes),
  };
}

export const paymentSchema = (balanceMinor: number) =>
  z.object({
    amount: moneyText("the amount").refine((value) => (toMinor(value) ?? 0) <= balanceMinor, {
      message: "Amount can't be more than the balance",
    }),
    method: z.string().min(1, "Choose a method"),
    reference: optionalText(100),
    paidOn: isoDate,
  });
export type PaymentFormValues = z.infer<ReturnType<typeof paymentSchema>>;

export const paymentDefaults = (balanceMinor: number): PaymentFormValues => ({
  amount: toMoneyText(balanceMinor),
  method: "BANK",
  reference: "",
  paidOn: todayIso(),
});

export function toPaymentInput(values: PaymentFormValues): ExpensePaymentInput {
  return {
    amountMinor: toMinor(values.amount) ?? 0,
    method: values.method as ExpensePaymentMethod,
    reference: blankToUndefined(values.reference),
    paidOn: values.paidOn,
  };
}
