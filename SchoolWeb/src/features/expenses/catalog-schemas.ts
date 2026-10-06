import { z } from "zod";
import { blankToUndefined, optionalEmail, optionalPhone, optionalText, requiredText } from "@/lib/validation";
import type { ExpenseCategoryInput, VendorInput } from "./types";

export const vendorSchema = z.object({
  name: requiredText("the vendor name", 150),
  contactPerson: optionalText(100),
  phone: optionalPhone,
  email: optionalEmail,
  address: optionalText(300),
  ntn: optionalText(30),
});
export type VendorFormValues = z.infer<typeof vendorSchema>;

export const vendorDefaults: VendorFormValues = { name: "", contactPerson: "", phone: "", email: "", address: "", ntn: "" };

export function toVendorInput(values: VendorFormValues): VendorInput {
  return {
    name: values.name.trim(),
    contactPerson: blankToUndefined(values.contactPerson),
    phone: blankToUndefined(values.phone),
    email: blankToUndefined(values.email),
    address: blankToUndefined(values.address),
    ntn: blankToUndefined(values.ntn),
  };
}

export const categorySchema = z.object({
  name: requiredText("the category name", 80),
  code: optionalText(30).refine((value) => !value || /^[A-Za-z0-9_]+$/.test(value), {
    message: "Use letters, digits or underscores",
  }),
});
export type CategoryFormValues = z.infer<typeof categorySchema>;

export const categoryDefaults: CategoryFormValues = { name: "", code: "" };

export function toCategoryInput(values: CategoryFormValues): ExpenseCategoryInput {
  const code = blankToUndefined(values.code);
  return { name: values.name.trim(), code: code?.toUpperCase() };
}
