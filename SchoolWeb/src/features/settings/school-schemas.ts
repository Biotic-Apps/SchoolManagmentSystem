import { z } from "zod";
import { DEFAULT_PRIMARY, isHexColor, passesContrast } from "@/features/branding/contrast";
import { blankToNull, optionalText, requiredText } from "@/lib/validation";
import type { SchoolSettings, SchoolSettingsInput } from "./types";

export const FOOTER_MAX = 300;

export const schoolSettingsSchema = z.object({
  displayName: requiredText("the display name"),
  logoFileId: z.string().nullable(),
  primaryColor: z
    .string()
    .trim()
    .refine(isHexColor, "Enter a hex colour like #7A2944")
    .refine(passesContrast, "Pick a darker colour so white text on it stays readable"),
  receiptFooter: optionalText(FOOTER_MAX),
  reportCardFooter: optionalText(FOOTER_MAX),
});

export type SchoolSettingsValues = z.infer<typeof schoolSettingsSchema>;

export function schoolSettingsToValues(settings: SchoolSettings): SchoolSettingsValues {
  return {
    displayName: settings.displayName ?? "",
    logoFileId: settings.logoFileId ?? null,
    primaryColor: (settings.primaryColor || DEFAULT_PRIMARY).toUpperCase(),
    receiptFooter: settings.receiptFooter ?? "",
    reportCardFooter: settings.reportCardFooter ?? "",
  };
}

export function toSchoolSettingsInput(values: SchoolSettingsValues): SchoolSettingsInput {
  return {
    displayName: values.displayName.trim(),
    logoFileId: values.logoFileId,
    primaryColor: values.primaryColor.trim().toUpperCase(),
    receiptFooter: blankToNull(values.receiptFooter),
    reportCardFooter: blankToNull(values.reportCardFooter),
  };
}
