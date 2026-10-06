import { z } from "zod";
import { blankToNull } from "@/lib/validation";
import type { CategoryChannels, NotificationSettings } from "./types";

const category = z.object({
  category: z.string(),
  email: z.boolean(),
  sms: z.boolean(),
  push: z.boolean(),
  inApp: z.boolean(),
});

export const notificationSettingsSchema = z
  .object({
    email: z.object({ enabled: z.boolean(), fromName: z.string().trim().max(60, "Use at most 60 characters") }),
    sms: z.object({ enabled: z.boolean(), senderId: z.string().trim().max(20, "Use at most 20 characters") }),
    push: z.object({ enabled: z.boolean() }),
    categories: z.array(category),
  })
  .superRefine((values, ctx) => {
    if (values.email.enabled && !values.email.fromName) {
      ctx.addIssue({ code: "custom", path: ["email", "fromName"], message: "Enter the sender name for emails" });
    }
    if (values.sms.enabled && !values.sms.senderId) {
      ctx.addIssue({ code: "custom", path: ["sms", "senderId"], message: "Enter the SMS sender ID" });
    }
  });

export type NotificationSettingsValues = z.infer<typeof notificationSettingsSchema>;

type RawCategory = Partial<CategoryChannels> & { category?: unknown };

// The per-category defaults may arrive as an array or keyed by category.
function readCategories(raw: unknown): CategoryChannels[] {
  const rows: RawCategory[] = Array.isArray(raw)
    ? (raw as RawCategory[])
    : Object.entries((raw ?? {}) as Record<string, RawCategory>).map(([key, value]) => ({ ...value, category: key }));
  return rows
    .filter((row) => typeof row?.category === "string")
    .map((row) => ({
      category: row.category as string,
      email: row.email === true,
      sms: row.sms === true,
      push: row.push === true,
      inApp: row.inApp === true,
    }));
}

export function notificationSettingsToValues(settings: NotificationSettings): NotificationSettingsValues {
  return {
    email: { enabled: settings.email?.enabled === true, fromName: settings.email?.fromName ?? "" },
    sms: { enabled: settings.sms?.enabled === true, senderId: settings.sms?.senderId ?? "" },
    push: { enabled: settings.push?.enabled === true },
    categories: readCategories(settings.categories),
  };
}

export function toNotificationSettingsInput(values: NotificationSettingsValues): NotificationSettings {
  return {
    email: { enabled: values.email.enabled, fromName: blankToNull(values.email.fromName) },
    sms: { enabled: values.sms.enabled, senderId: blankToNull(values.sms.senderId) },
    push: { enabled: values.push.enabled },
    categories: values.categories,
  };
}
