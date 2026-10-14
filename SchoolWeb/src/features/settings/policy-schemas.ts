import { z } from "zod";
import { isRoleKey, type RoleKey } from "@/config/roles";
import { moneyText, toMinor, toMoneyText } from "@/lib/money";
import { blankToNull, timeOfDay } from "@/lib/validation";
import { APPROVAL_LIMIT_TYPES, type ApprovalLimitType, type PolicySettings } from "./types";

const DEFAULT_LOCK_TIME = "11:00";

const wholeNumberIn = (min: number, max: number) =>
  z
    .string()
    .trim()
    .refine((value) => /^\d+$/.test(value) && Number(value) >= min && Number(value) <= max, {
      message: `Enter a whole number from ${min} to ${max}`,
    });

const limitText = () => moneyText("the limit", { required: false });

const approvalLimits = z.object({
  CONCESSION: limitText(),
  REFUND: limitText(),
  EXPENSE: limitText(),
  PURCHASE_ORDER: limitText(),
} satisfies Record<ApprovalLimitType, z.ZodType<string>>);

export const policySettingsSchema = z
  .object({
    passwordMinLength: wholeNumberIn(8, 64),
    requireDigit: z.boolean(),
    sessionTimeoutMinutes: wholeNumberIn(5, 1440),
    twoFactorRequiredFor: z.array(z.string()),
    attendanceLockTime: timeOfDay,
    diaryModeration: z.boolean(),
    // A grading scheme id (UUID) or "" for no default.
    gradingDefault: z.string(),
    lateFeeAmount: moneyText("the late fee", { required: false }),
    lateFeeAfterDays: z.string().trim(),
    approvalLimits,
  })
  .superRefine((values, ctx) => {
    if (!values.lateFeeAmount) return;
    const days = values.lateFeeAfterDays;
    if (!/^\d+$/.test(days) || Number(days) < 1 || Number(days) > 365) {
      ctx.addIssue({ code: "custom", path: ["lateFeeAfterDays"], message: "Enter a whole number of days from 1 to 365" });
    }
  });

export type PolicySettingsValues = z.infer<typeof policySettingsSchema>;

function numberText(value: unknown, fallback: number): string {
  return String(typeof value === "number" && Number.isFinite(value) ? value : fallback);
}

function limitValue(limits: Record<string, number>, type: ApprovalLimitType): string {
  const value = limits[type];
  return typeof value === "number" ? toMoneyText(value) : "";
}

export function policySettingsToValues(settings: PolicySettings): PolicySettingsValues {
  const limits = settings.approvalLimits ?? {};
  const lateFee = settings.feeLateFeeDefault;
  return {
    passwordMinLength: numberText(settings.passwordPolicy?.minLength, 8),
    requireDigit: settings.passwordPolicy?.requireDigit === true,
    sessionTimeoutMinutes: numberText(settings.sessionTimeoutMinutes, 60),
    twoFactorRequiredFor: (settings.twoFactorRequiredFor ?? []).filter(isRoleKey),
    attendanceLockTime: settings.attendanceLockTime || DEFAULT_LOCK_TIME,
    diaryModeration: settings.diaryModeration === true,
    gradingDefault: settings.gradingDefault ?? "",
    lateFeeAmount: typeof lateFee?.amountMinor === "number" ? toMoneyText(lateFee.amountMinor) : "",
    lateFeeAfterDays: typeof lateFee?.afterDays === "number" ? String(lateFee.afterDays) : "",
    approvalLimits: {
      CONCESSION: limitValue(limits, "CONCESSION"),
      REFUND: limitValue(limits, "REFUND"),
      EXPENSE: limitValue(limits, "EXPENSE"),
      PURCHASE_ORDER: limitValue(limits, "PURCHASE_ORDER"),
    },
  };
}

/** Limits for other request types are kept; a blank limit is removed. */
export function toPolicySettingsInput(values: PolicySettingsValues, current: PolicySettings): PolicySettings {
  const limits: Record<string, number> = { ...(current.approvalLimits ?? {}) };
  for (const type of APPROVAL_LIMIT_TYPES) {
    const amount = toMinor(values.approvalLimits[type]);
    if (amount === null) delete limits[type];
    else limits[type] = amount;
  }
  const lateFee = toMinor(values.lateFeeAmount);
  return {
    attendanceLockTime: values.attendanceLockTime,
    diaryModeration: values.diaryModeration,
    gradingDefault: blankToNull(values.gradingDefault),
    feeLateFeeDefault: lateFee === null ? null : { amountMinor: lateFee, afterDays: Number(values.lateFeeAfterDays) },
    approvalLimits: limits,
    passwordPolicy: { minLength: Number(values.passwordMinLength), requireDigit: values.requireDigit },
    sessionTimeoutMinutes: Number(values.sessionTimeoutMinutes),
    twoFactorRequiredFor: values.twoFactorRequiredFor.filter((role): role is RoleKey => isRoleKey(role)),
  };
}
