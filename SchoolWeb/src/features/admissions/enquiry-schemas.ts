import { z } from "zod";
import {
  blankToNull,
  blankToUndefined,
  optionalEmail,
  optionalIsoDate,
  optionalText,
  requiredText,
} from "@/lib/validation";
import type { Enquiry, EnquiryInput, EnquiryStatus, EnquiryUpdate } from "./types";

export const enquirySchema = z.object({
  classId: z.string().min(1, "Choose a class"),
  childName: requiredText("the child's name"),
  dob: optionalIsoDate,
  guardianName: requiredText("the guardian's name"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,20}$/, "Enter a valid phone number"),
  email: optionalEmail,
  source: optionalText(60),
  notes: optionalText(1000),
  followUpDate: optionalIsoDate,
});
export type EnquiryFormValues = z.infer<typeof enquirySchema>;

export const enquiryFormDefaults = (classId: string | undefined): EnquiryFormValues => ({
  classId: classId ?? "",
  childName: "",
  dob: "",
  guardianName: "",
  phone: "",
  email: "",
  source: "",
  notes: "",
  followUpDate: "",
});

export function toEnquiryInput(
  values: EnquiryFormValues,
  context: { branchId: string; sessionId: string },
): EnquiryInput {
  return {
    branchId: context.branchId,
    sessionId: context.sessionId,
    classId: values.classId,
    childName: values.childName.trim(),
    dob: blankToUndefined(values.dob),
    guardianName: values.guardianName.trim(),
    phone: values.phone.trim(),
    email: blankToUndefined(values.email),
    source: blankToUndefined(values.source),
    notes: blankToUndefined(values.notes),
    followUpDate: blankToUndefined(values.followUpDate),
  };
}

export const enquiryUpdateSchema = z.object({
  status: z.string().min(1, "Choose a status"),
  notes: optionalText(1000),
  followUpDate: optionalIsoDate,
});
export type EnquiryUpdateValues = z.infer<typeof enquiryUpdateSchema>;

export const enquiryUpdateDefaults = (item: Enquiry): EnquiryUpdateValues => ({
  status: item.status,
  notes: item.notes ?? "",
  followUpDate: item.followUpDate ?? "",
});

/** Status is sent only when it changed (a converted enquiry can still get notes). */
export const toEnquiryUpdate = (values: EnquiryUpdateValues, item: Enquiry): EnquiryUpdate => ({
  ...(values.status !== item.status ? { status: values.status as EnquiryStatus } : {}),
  notes: blankToNull(values.notes),
  followUpDate: blankToNull(values.followUpDate),
});
