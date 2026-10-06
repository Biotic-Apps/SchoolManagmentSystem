import { z } from "zod";

// Money travels as integer minor units (paisa); forms take rupees as text.

const MONEY_TEXT = /^\d+(\.\d{1,2})?$/;

/** "1,250.50" → 125050; null when blank or invalid. */
export function toMinor(text: string | null | undefined): number | null {
  const clean = (text ?? "").replace(/,/g, "").trim();
  if (!MONEY_TEXT.test(clean)) return null;
  return Math.round(Number(clean) * 100);
}

/** 125050 → "1250.5" for prefilling a money input. */
export function toMoneyText(amountMinor: number | null | undefined): string {
  if (amountMinor === null || amountMinor === undefined) return "";
  return String(amountMinor / 100);
}

/** Form rule for a rupee amount typed as text. */
export const moneyText = (label: string, { required = true, allowZero = false } = {}) =>
  z
    .string()
    .trim()
    .refine((value) => (!required && !value) || toMinor(value) !== null, {
      message: `Enter ${label} as an amount, e.g. 1500 or 1500.50`,
    })
    .refine((value) => !value || allowZero || (toMinor(value) ?? 0) > 0, { message: `${capital(label)} must be more than 0` });

function capital(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
