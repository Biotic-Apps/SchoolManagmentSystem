import { z } from "zod";
import { moneyText, toMinor } from "@/lib/money";
import { isPeriod } from "@/lib/period";
import { blankToUndefined, isoDate, optionalText, requiredText } from "@/lib/validation";
import type { AdjustmentInput, AdjustmentKind, PaymentMethod, PayrollPaymentInput, SalaryStructureInput } from "./types";

const month = z.string().refine(isPeriod, { message: "Pick a month" });

export const paymentSchema = z.object({
  amount: moneyText("the amount"),
  method: z.string().min(1, "Choose how it was paid"),
  reference: optionalText(80),
  paidOn: isoDate,
});
export type PaymentValues = z.infer<typeof paymentSchema>;

export function toPaymentInput(staffId: string, values: PaymentValues): PayrollPaymentInput {
  return {
    staffId,
    amountMinor: toMinor(values.amount) ?? 0,
    method: values.method as PaymentMethod,
    reference: blankToUndefined(values.reference),
    paidOn: values.paidOn,
  };
}

const salaryItem = z.object({ name: requiredText("a name", 60), amount: moneyText("the amount") });
export type SalaryItemValues = z.infer<typeof salaryItem>;

export const structureSchema = z.object({
  effectiveFrom: month,
  basic: moneyText("the basic salary"),
  allowances: z.array(salaryItem),
  deductions: z.array(salaryItem),
});
export type StructureValues = z.infer<typeof structureSchema>;

export function toStructureInput(values: StructureValues): SalaryStructureInput {
  const items = (list: SalaryItemValues[]) => list.map((item) => ({ name: item.name.trim(), amountMinor: toMinor(item.amount) ?? 0 }));
  return {
    effectiveFrom: values.effectiveFrom,
    basicMinor: toMinor(values.basic) ?? 0,
    allowances: items(values.allowances),
    deductions: items(values.deductions),
  };
}

export const adjustmentSchema = z.object({
  staffId: z.string().min(1, "Choose a staff member"),
  month,
  kind: z.string().min(1, "Choose a kind"),
  amount: moneyText("the amount"),
  reason: requiredText("a reason", 500),
});
export type AdjustmentValues = z.infer<typeof adjustmentSchema>;

export function toAdjustmentInput(values: AdjustmentValues): AdjustmentInput {
  return {
    staffId: values.staffId,
    month: values.month,
    kind: values.kind as AdjustmentKind,
    amountMinor: toMinor(values.amount) ?? 0,
    reason: values.reason.trim(),
  };
}
