import { z } from "zod";
import { addDays, todayIso } from "@/lib/dates";
import { moneyText, toMinor } from "@/lib/money";
import { currentPeriod, isPeriod } from "@/lib/period";
import { isoDate, requiredText } from "@/lib/validation";
import type { AdHocInvoiceInput, GenerateInvoicesInput } from "./invoices-api";

export const generateInvoicesSchema = z.object({
  sessionId: z.string().min(1, "Choose a session"),
  period: z.string().refine(isPeriod, "Pick a month"),
  classIds: z.array(z.string()),
});
export type GenerateInvoicesValues = z.infer<typeof generateInvoicesSchema>;

export const generateInvoicesDefaults = (sessionId: string | null, period: string): GenerateInvoicesValues => ({
  sessionId: sessionId ?? "",
  period: period || currentPeriod(),
  classIds: [],
});

export const toGenerateInvoicesInput = (values: GenerateInvoicesValues, branchId: string): GenerateInvoicesInput => ({
  branchId,
  sessionId: values.sessionId,
  period: values.period,
  classIds: values.classIds.length ? values.classIds : undefined,
});

const invoiceLineSchema = z.object({
  feeHeadId: z.string().min(1, "Choose a fee head"),
  description: requiredText("a description", 200),
  amount: moneyText("the amount"),
});

export const adHocInvoiceSchema = z.object({
  studentId: z.string().min(1, "Choose a student"),
  dueDate: isoDate,
  lines: z.array(invoiceLineSchema).min(1, "Add at least one line"),
});
export type AdHocInvoiceValues = z.infer<typeof adHocInvoiceSchema>;

export const EMPTY_INVOICE_LINE: AdHocInvoiceValues["lines"][number] = { feeHeadId: "", description: "", amount: "" };

export const adHocInvoiceDefaults = (): AdHocInvoiceValues => ({
  studentId: "",
  dueDate: addDays(todayIso(), 10),
  lines: [{ ...EMPTY_INVOICE_LINE }],
});

export const toAdHocInvoiceInput = (values: AdHocInvoiceValues): AdHocInvoiceInput => ({
  studentId: values.studentId,
  dueDate: values.dueDate,
  lines: values.lines.map((line) => ({
    feeHeadId: line.feeHeadId,
    description: line.description.trim(),
    amountMinor: toMinor(line.amount) ?? 0,
  })),
});
