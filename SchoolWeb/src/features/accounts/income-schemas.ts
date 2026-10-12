import { z } from "zod";
import { todayIso } from "@/lib/dates";
import { moneyText, toMinor } from "@/lib/money";
import { blankToUndefined, isoDate, optionalText, requiredText } from "@/lib/validation";
import type { IncomeCategoryInput, IncomeInput } from "./types";

export const incomeSchema = z.object({
  categoryId: z.string().min(1, "Choose a category"),
  title: requiredText("a title", 150),
  description: optionalText(500),
  amount: moneyText("the amount"),
  receivedOn: isoDate,
  receiptFileId: z.string(),
  notes: optionalText(1000),
});
export type IncomeFormValues = z.infer<typeof incomeSchema>;

export const incomeDefaults = (): IncomeFormValues => ({
  categoryId: "",
  title: "",
  description: "",
  amount: "",
  receivedOn: todayIso(),
  receiptFileId: "",
  notes: "",
});

export function toIncomeInput(branchId: string, values: IncomeFormValues): IncomeInput {
  return {
    branchId,
    categoryId: values.categoryId,
    title: values.title.trim(),
    description: blankToUndefined(values.description),
    amountMinor: toMinor(values.amount) ?? 0,
    receivedOn: values.receivedOn,
    receiptFileId: blankToUndefined(values.receiptFileId),
    notes: blankToUndefined(values.notes),
  };
}

export const incomeCategorySchema = z.object({
  name: requiredText("the category name", 80),
  code: optionalText(30).refine((value) => !value || /^[A-Za-z0-9_]+$/.test(value), {
    message: "Use letters, digits or underscores",
  }),
});
export type IncomeCategoryFormValues = z.infer<typeof incomeCategorySchema>;

export const incomeCategoryDefaults: IncomeCategoryFormValues = { name: "", code: "" };

export function toIncomeCategoryInput(values: IncomeCategoryFormValues): IncomeCategoryInput {
  const code = blankToUndefined(values.code);
  return { name: values.name.trim(), code: code?.toUpperCase() };
}
