import { z } from "zod";
import type { SessionUser } from "@/features/auth/types";
import { blankToNull, optionalEmail, optionalPhone, requiredText } from "@/lib/validation";
import type { ProfileInput } from "./types";

export const profileSchema = z
  .object({
    name: requiredText("your name"),
    email: optionalEmail,
    phone: optionalPhone,
  })
  .superRefine((values, ctx) => {
    if (values.email || values.phone) return;
    const message = "Enter an email or a phone number so you can sign in";
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["email"], message });
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phone"], message });
  });

export type ProfileFormValues = z.infer<typeof profileSchema>;

export function profileFormDefaults(user: SessionUser | undefined): ProfileFormValues {
  return { name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "" };
}

export function toProfileInput(values: ProfileFormValues): ProfileInput {
  return { name: values.name.trim(), email: blankToNull(values.email), phone: blankToNull(values.phone) };
}
