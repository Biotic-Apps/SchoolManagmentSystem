import { z } from "zod";
import { blankToNull, optionalEmail, optionalPhone, optionalText, optionalUrl, requiredText } from "@/lib/validation";
import type { School, SchoolInput } from "./types";

export const schoolSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{2,12}$/, "Use 2–12 uppercase letters or digits"),
  name: requiredText("the school name"),
  address: optionalText(),
  phone: optionalPhone,
  email: optionalEmail,
  website: optionalUrl,
  /** "" keeps the current logo; a new upload sets the file id. */
  logoFileId: z.string(),
  removeLogo: z.boolean(),
});

export type SchoolFormValues = z.infer<typeof schoolSchema>;

export function schoolFormDefaults(school: School | null): SchoolFormValues {
  return {
    code: school?.code ?? "",
    name: school?.name ?? "",
    address: school?.address ?? "",
    phone: school?.phone ?? "",
    email: school?.email ?? "",
    website: school?.website ?? "",
    logoFileId: "",
    removeLogo: false,
  };
}

export function toSchoolInput(values: SchoolFormValues, isEdit: boolean): SchoolInput {
  const logoFileId = values.removeLogo ? null : values.logoFileId || undefined;
  return {
    ...(isEdit ? {} : { code: values.code }),
    name: values.name.trim(),
    address: blankToNull(values.address),
    phone: blankToNull(values.phone),
    email: blankToNull(values.email),
    website: blankToNull(values.website),
    ...(logoFileId !== undefined ? { logoFileId } : {}),
  };
}
