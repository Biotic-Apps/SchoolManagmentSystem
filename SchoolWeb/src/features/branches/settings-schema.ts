import { z } from "zod";
import { optionalText, timeOfDay } from "@/lib/validation";
import type { BranchSettings } from "./types";

export const branchSettingsSchema = z
  .object({
    attendanceLockTime: timeOfDay,
    diaryModeration: z.boolean(),
    diaryClosingTime: timeOfDay,
    officeFrom: timeOfDay,
    officeTo: timeOfDay,
    // Printed on every fee challan copy (fees.bankAccount / fees.challanNote).
    bankName: optionalText(80),
    bankAccountTitle: optionalText(100),
    bankAccountNumber: optionalText(34),
    bankBranchCode: optionalText(20),
    challanNote: optionalText(300),
  })
  .refine((values) => values.officeTo > values.officeFrom, {
    path: ["officeTo"],
    message: "Office hours must end after they start",
  })
  .refine((values) => !values.bankName || !!values.bankAccountNumber, {
    path: ["bankAccountNumber"],
    message: "Enter the account number parents deposit into",
  });

export type BranchSettingsValues = z.infer<typeof branchSettingsSchema>;

// Settings may arrive flat ("attendance.lockTime") or nested ({ attendance: { lockTime } }).
function read(settings: BranchSettings, key: string): unknown {
  if (key in settings) return settings[key];
  return key.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], settings);
}

function text(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

export function settingsToValues(settings: BranchSettings): BranchSettingsValues {
  const office = (read(settings, "messaging.officeHours") ?? {}) as { from?: unknown; to?: unknown };
  const bank = (read(settings, "fees.bankAccount") ?? {}) as Record<string, unknown>;
  return {
    attendanceLockTime: text(read(settings, "attendance.lockTime"), "11:00"),
    diaryModeration: read(settings, "diary.moderation") === true,
    diaryClosingTime: text(read(settings, "diary.closingTime"), "15:00"),
    officeFrom: text(office.from, "08:00"),
    officeTo: text(office.to, "16:00"),
    bankName: text(bank.bankName, ""),
    bankAccountTitle: text(bank.accountTitle, ""),
    bankAccountNumber: text(bank.accountNumber, ""),
    bankBranchCode: text(bank.branchCode, ""),
    challanNote: text(read(settings, "fees.challanNote"), ""),
  };
}

export function valuesToSettings(values: BranchSettingsValues): BranchSettings {
  return {
    "attendance.lockTime": values.attendanceLockTime,
    "diary.moderation": values.diaryModeration,
    "diary.closingTime": values.diaryClosingTime,
    "messaging.officeHours": { from: values.officeFrom, to: values.officeTo },
    "fees.bankAccount": {
      bankName: values.bankName,
      accountTitle: values.bankAccountTitle,
      accountNumber: values.bankAccountNumber,
      branchCode: values.bankBranchCode,
    },
    "fees.challanNote": values.challanNote,
  };
}
