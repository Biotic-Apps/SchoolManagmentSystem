import { z } from "zod";
import type { ChildLinkStart, ContactChangeInput } from "@/features/guardians/types";
import type { Relation } from "@/features/people/types";
import { blankToUndefined, isoDate, optionalEmail, optionalPhone, optionalText, requiredText } from "@/lib/validation";

export const contactChangeSchema = z
  .object({ newPhone: optionalPhone, newEmail: optionalEmail, newAddress: optionalText(255) })
  .refine((values) => !!(values.newPhone || values.newEmail || values.newAddress), {
    path: ["newPhone"],
    message: "Enter at least one new contact detail",
  });
export type ContactChangeValues = z.infer<typeof contactChangeSchema>;

// Field names differ from the profile form's so the two cards never share DOM ids.
export const EMPTY_CONTACT_CHANGE: ContactChangeValues = { newPhone: "", newEmail: "", newAddress: "" };

export function toContactChangeInput(values: ContactChangeValues): ContactChangeInput {
  return {
    phone: blankToUndefined(values.newPhone),
    email: blankToUndefined(values.newEmail),
    address: blankToUndefined(values.newAddress),
  };
}

export const linkChildSchema = z.object({
  admissionNo: requiredText("the admission number", 40),
  dob: isoDate,
  relation: z.string().min(1, "Choose your relation"),
});
export type LinkChildValues = z.infer<typeof linkChildSchema>;

export const EMPTY_LINK_CHILD: LinkChildValues = { admissionNo: "", dob: "", relation: "" };

export function toChildLinkStart(values: LinkChildValues): ChildLinkStart {
  return { admissionNo: values.admissionNo.trim(), dob: values.dob, relation: values.relation as Relation };
}

export const otpSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{4,8}$/, "Enter the code from the SMS"),
});
export type OtpValues = z.infer<typeof otpSchema>;
