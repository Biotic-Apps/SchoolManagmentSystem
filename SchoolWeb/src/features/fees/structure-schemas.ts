import { z } from "zod";
import { moneyText, toMinor, toMoneyText } from "@/lib/money";
import { requiredText, wholeNumberText } from "@/lib/validation";
import type { FeeHeadInput } from "./structure-api";
import type { FeeFrequency, FeeHeadKind, FeePlan, FeePlanInput } from "./types";

export const feeHeadSchema = z.object({
  code: requiredText("a code", 20),
  name: requiredText("a name", 80),
  kind: z.enum(["RECURRING", "ONE_TIME"]),
  refundable: z.boolean(),
});
export type FeeHeadFormValues = z.infer<typeof feeHeadSchema>;

export const FEE_HEAD_DEFAULTS: FeeHeadFormValues = { code: "", name: "", kind: "RECURRING", refundable: false };

export const toFeeHeadInput = (values: FeeHeadFormValues, schoolId: string): FeeHeadInput => ({
  schoolId,
  code: values.code.trim().toUpperCase(),
  name: values.name.trim(),
  kind: values.kind as FeeHeadKind,
  refundable: values.refundable,
});

const planItemSchema = z.object({
  feeHeadId: z.string().min(1, "Choose a fee head"),
  amount: moneyText("the amount"),
  frequency: z.enum(["MONTHLY", "QUARTERLY", "TERM", "YEARLY", "ONCE"]),
  dueDay: z.string().min(1, "Choose a due day"),
});

export const feePlanSchema = z
  .object({
    classId: z.string().min(1, "Choose a class"),
    name: requiredText("a plan name", 120),
    items: z.array(planItemSchema).min(1, "Add at least one fee"),
    hasLateFee: z.boolean(),
    lateFeeAmount: moneyText("the late fee", { required: false }),
    lateFeeAfterDays: wholeNumberText("the days", { min: 1, required: false }),
  })
  .refine((values) => !values.hasLateFee || !!values.lateFeeAmount, {
    path: ["lateFeeAmount"],
    message: "Enter the late fee",
  })
  .refine((values) => !values.hasLateFee || !!values.lateFeeAfterDays, {
    path: ["lateFeeAfterDays"],
    message: "Enter after how many days it applies",
  })
  .refine((values) => new Set(values.items.map((item) => item.feeHeadId)).size === values.items.length, {
    path: ["items"],
    message: "Each fee head can appear only once",
  });
export type FeePlanFormValues = z.infer<typeof feePlanSchema>;
export type FeePlanItemValues = FeePlanFormValues["items"][number];

export const EMPTY_PLAN_ITEM: FeePlanItemValues = { feeHeadId: "", amount: "", frequency: "MONTHLY", dueDay: "10" };

export const feePlanDefaults = (plan: FeePlan | null): FeePlanFormValues => ({
  classId: plan?.classId ?? "",
  name: plan?.name ?? "",
  items: plan?.items.length
    ? plan.items.map((item) => ({
        feeHeadId: item.feeHeadId,
        amount: toMoneyText(item.amountMinor),
        frequency: item.frequency,
        dueDay: String(item.dueDay),
      }))
    : [{ ...EMPTY_PLAN_ITEM }],
  hasLateFee: !!plan?.lateFee,
  lateFeeAmount: toMoneyText(plan?.lateFee?.amountMinor),
  lateFeeAfterDays: plan?.lateFee ? String(plan.lateFee.afterDays) : "",
});

export const toFeePlanInput = (
  values: FeePlanFormValues,
  scope: { branchId: string; sessionId: string },
): FeePlanInput => ({
  ...scope,
  classId: values.classId,
  name: values.name.trim(),
  items: values.items.map((item) => ({
    feeHeadId: item.feeHeadId,
    amountMinor: toMinor(item.amount) ?? 0,
    frequency: item.frequency as FeeFrequency,
    dueDay: Number(item.dueDay),
  })),
  lateFee: values.hasLateFee
    ? { amountMinor: toMinor(values.lateFeeAmount) ?? 0, afterDays: Number(values.lateFeeAfterDays) }
    : null,
});
