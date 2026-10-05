import { z } from "zod";

// Shared field rules that mirror the API contract (docs/api/phase1-contract.md).

export const requiredText = (label: string, max = 120) =>
  z.string().trim().min(1, `Enter ${label}`).max(max, `Use at most ${max} characters`);

export const optionalText = (max = 255) => z.string().trim().max(max, `Use at most ${max} characters`);

export const optionalEmail = z.string().trim().refine((value) => !value || z.string().email().safeParse(value).success, {
  message: "Enter a valid email address",
});

export const optionalPhone = z
  .string()
  .trim()
  .refine((value) => !value || /^\+?[0-9\s-]{7,20}$/.test(value), { message: "Enter a valid phone number" });

export const optionalUrl = z.string().trim().refine((value) => !value || /^https?:\/\/\S+\.\S+/.test(value), {
  message: "Enter a full web address, e.g. https://school.edu.pk",
});

/** Min 8 chars with at least one letter and one digit. */
export const passwordRule = z
  .string()
  .min(8, "Use at least 8 characters")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one digit");

export const timeOfDay = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM (24-hour)");

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date");

export const optionalIsoDate = z.string().refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
  message: "Pick a date",
});

export const wholeNumberText = (label: string, { min = 0, required = true } = {}) =>
  z
    .string()
    .trim()
    .refine((value) => (!required && !value) || (/^\d+$/.test(value) && Number(value) >= min), {
      message: `Enter ${label} as a whole number${min ? ` of at least ${min}` : ""}`,
    });

/** Empty form strings become undefined so optional API fields are omitted. */
export function blankToUndefined(value: string | undefined | null): string | undefined {
  return value && value.trim() ? value.trim() : undefined;
}

export function blankToNull(value: string | undefined | null): string | null {
  return value && value.trim() ? value.trim() : null;
}
