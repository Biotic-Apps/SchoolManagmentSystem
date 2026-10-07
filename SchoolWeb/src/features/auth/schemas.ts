import { z } from "zod";
import { passwordRule } from "@/lib/validation";

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or phone"),
  password: z.string().min(1, "Enter your password"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, "Repeat the new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    path: ["newPassword"],
    message: "Choose a password different from the current one",
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const twoFactorCodeSchema = z.object({
  mode: z.enum(["totp", "recovery"]),
  code: z.string().trim().min(1, "Enter the code"),
}).superRefine((values, ctx) => {
  if (values.mode === "totp" && !/^\d{6}$/.test(values.code.replace(/\s/g, ""))) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["code"], message: "Enter the 6-digit code from your app" });
  }
  if (values.mode === "recovery" && values.code.length > 64) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["code"], message: "This is not a recovery code" });
  }
});

export type TwoFactorCodeValues = z.infer<typeof twoFactorCodeSchema>;

export const forgotPasswordSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or phone"),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, "Enter the reset code you received"),
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, "Repeat the new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const otpPhoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, "Enter your mobile number")
    .regex(/^\+?[\d\s()-]{7,20}$/, "Enter a mobile number like 0300 1234567"),
});

export type OtpPhoneValues = z.infer<typeof otpPhoneSchema>;

export const otpCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .refine((value) => /^\d{6}$/.test(value.replace(/\s/g, "")), "Enter the 6-digit code from the SMS"),
});

export type OtpCodeValues = z.infer<typeof otpCodeSchema>;
