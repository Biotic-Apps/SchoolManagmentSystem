import { z } from "zod";
import { moneyText, toMinor } from "@/lib/money";
import { isPeriod } from "@/lib/period";
import { blankToUndefined, isoDate, optionalText, requiredText } from "@/lib/validation";
import type {
  AdjustmentInput,
  AdjustmentKind,
  OvertimeInput,
  PaymentMethod,
  PayrollPaymentInput,
  PayrollSettings,
  SalaryStructureInput,
} from "./types";

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
  overtimeRate: moneyText("the overtime rate", { required: false }),
});
export type StructureValues = z.infer<typeof structureSchema>;

export function toStructureInput(values: StructureValues): SalaryStructureInput {
  const items = (list: SalaryItemValues[]) => list.map((item) => ({ name: item.name.trim(), amountMinor: toMinor(item.amount) ?? 0 }));
  return {
    effectiveFrom: values.effectiveFrom,
    basicMinor: toMinor(values.basic) ?? 0,
    allowances: items(values.allowances),
    deductions: items(values.deductions),
    overtimeRateMinor: toMinor(values.overtimeRate) || null,
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

export const overtimeSchema = z.object({
  staffId: z.string().min(1, "Choose a staff member"),
  date: isoDate,
  hours: z
    .string()
    .trim()
    .refine((value) => /^\d{1,2}(\.\d{1,2})?$/.test(value) && Number(value) > 0 && Number(value) <= 16, {
      message: "Enter hours between 0.25 and 16, e.g. 2 or 1.5",
    }),
  reason: requiredText("a reason", 300),
});
export type OvertimeValues = z.infer<typeof overtimeSchema>;

export function toOvertimeInput(values: OvertimeValues): OvertimeInput {
  return {
    staffId: values.staffId,
    date: values.date,
    minutes: Math.round(Number(values.hours) * 60),
    reason: values.reason.trim(),
  };
}

export const settingsSchema = z.object({
  workingDaysMode: z.enum(["CALENDAR", "FIXED"]),
  fixedWorkingDays: z.number().int().min(1).max(31),
  perDayBase: z.enum(["GROSS", "BASIC"]),
  latesPerDeduction: z.number().int().min(0).max(31),
  lateDeductionDays: z.enum(["0.5", "1", "2"]),
  overtimeEnabled: z.boolean(),
  overtimeMultiplier: z.enum(["1", "1.25", "1.5", "2"]),
  overtimeGraceMinutes: z.number().int().min(0).max(240),
  dailyHours: z.string().trim().refine((value) => !value || (/^\d{1,2}(\.\d{1,2})?$/.test(value) && Number(value) >= 1 && Number(value) <= 16), {
    message: "Enter hours between 1 and 16, or leave empty",
  }),
});
export type SettingsValues = z.infer<typeof settingsSchema>;

export function toSettingsInput(values: SettingsValues): PayrollSettings {
  return {
    workingDaysMode: values.workingDaysMode,
    fixedWorkingDays: values.fixedWorkingDays,
    perDayBase: values.perDayBase,
    latesPerDeduction: values.latesPerDeduction,
    lateDeductionDays: Number(values.lateDeductionDays),
    overtimeEnabled: values.overtimeEnabled,
    overtimeMultiplier: Number(values.overtimeMultiplier),
    overtimeGraceMinutes: values.overtimeGraceMinutes,
    dailyHours: values.dailyHours ? Number(values.dailyHours) : null,
  };
}
