import { z } from "zod";
import { timeOfDay } from "@/lib/validation";
import type { BranchSettings } from "./types";

export const branchSettingsSchema = z
  .object({
    attendanceLockTime: timeOfDay,
    diaryModeration: z.boolean(),
    diaryClosingTime: timeOfDay,
    officeFrom: timeOfDay,
    officeTo: timeOfDay,
  })
  .refine((values) => values.officeTo > values.officeFrom, {
    path: ["officeTo"],
    message: "Office hours must end after they start",
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
  return {
    attendanceLockTime: text(read(settings, "attendance.lockTime"), "11:00"),
    diaryModeration: read(settings, "diary.moderation") === true,
    diaryClosingTime: text(read(settings, "diary.closingTime"), "15:00"),
    officeFrom: text(office.from, "08:00"),
    officeTo: text(office.to, "16:00"),
  };
}

export function valuesToSettings(values: BranchSettingsValues): BranchSettings {
  return {
    "attendance.lockTime": values.attendanceLockTime,
    "diary.moderation": values.diaryModeration,
    "diary.closingTime": values.diaryClosingTime,
    "messaging.officeHours": { from: values.officeFrom, to: values.officeTo },
  };
}
