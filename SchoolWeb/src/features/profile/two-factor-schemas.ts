import { z } from "zod";

const totpCode = z
  .string()
  .trim()
  .transform((value) => value.replace(/\s/g, ""))
  .refine((value) => /^\d{6}$/.test(value), "Enter the 6-digit code from your app");

export const enableTwoFactorSchema = z.object({ code: totpCode });

export type EnableTwoFactorValues = z.input<typeof enableTwoFactorSchema>;

export const disableTwoFactorSchema = z.object({
  password: z.string().min(1, "Enter your password"),
  code: z.string().trim().min(1, "Enter a code from your app or a recovery code").max(64, "This code is too long"),
});

export type DisableTwoFactorValues = z.infer<typeof disableTwoFactorSchema>;
