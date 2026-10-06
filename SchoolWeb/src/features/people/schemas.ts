import { z } from "zod";
import { blankToUndefined, isoDate, optionalEmail, optionalText, requiredText } from "@/lib/validation";
import type { ChildInput, Gender, GuardianEntry, GuardianInput, MedicalInfo, Relation } from "./types";

const phoneRequired = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s-]{7,20}$/, "Enter a valid phone number");

const cnicRule = z
  .string()
  .trim()
  .refine((value) => !value || /^\d{5}-?\d{7}-?\d$/.test(value), { message: "Use 13 digits, e.g. 35202-1234567-1" });

export const childSchema = z.object({
  firstName: requiredText("the first name", 60),
  lastName: requiredText("the last name", 60),
  dob: isoDate,
  gender: z.string().min(1, "Choose a gender"),
  bForm: cnicRule,
  previousSchool: optionalText(120),
  photoFileId: z.string(),
});
export type ChildValues = z.infer<typeof childSchema>;

export const EMPTY_CHILD: ChildValues = {
  firstName: "",
  lastName: "",
  dob: "",
  gender: "",
  bForm: "",
  previousSchool: "",
  photoFileId: "",
};

export const guardianSchema = z.object({
  name: requiredText("the guardian's name"),
  relation: z.string().min(1, "Choose the relation"),
  cnic: cnicRule,
  phone: phoneRequired,
  email: optionalEmail,
  occupation: optionalText(80),
  address: optionalText(255),
});
export type GuardianValues = z.infer<typeof guardianSchema>;

export const guardianEntrySchema = guardianSchema.extend({ isPrimary: z.boolean() });
export type GuardianEntryValues = z.infer<typeof guardianEntrySchema>;

export const EMPTY_GUARDIAN: GuardianEntryValues = {
  name: "",
  relation: "",
  cnic: "",
  phone: "",
  email: "",
  occupation: "",
  address: "",
  isPrimary: false,
};

/** At least one guardian, exactly one marked primary. */
export const guardianListSchema = z
  .array(guardianEntrySchema)
  .min(1, "Add at least one guardian")
  .refine((rows) => rows.filter((row) => row.isPrimary).length === 1, {
    message: "Mark exactly one guardian as primary",
  });

export const medicalSchema = z.object({
  allergies: optionalText(255),
  conditions: optionalText(255),
  notes: optionalText(500),
});
export type MedicalValues = z.infer<typeof medicalSchema>;

export const EMPTY_MEDICAL: MedicalValues = { allergies: "", conditions: "", notes: "" };

export function toChildInput(values: ChildValues): ChildInput {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    dob: values.dob,
    gender: values.gender as Gender,
    bForm: blankToUndefined(values.bForm),
    previousSchool: blankToUndefined(values.previousSchool),
    photoFileId: blankToUndefined(values.photoFileId),
  };
}

export function toGuardianInput(values: GuardianValues): GuardianInput {
  return {
    name: values.name.trim(),
    relation: values.relation as Relation,
    cnic: blankToUndefined(values.cnic),
    phone: values.phone.trim(),
    email: blankToUndefined(values.email),
    occupation: blankToUndefined(values.occupation),
    address: blankToUndefined(values.address),
  };
}

export function toGuardianEntries(rows: GuardianEntryValues[]): GuardianEntry[] {
  return rows.map((row) => ({ ...toGuardianInput(row), isPrimary: row.isPrimary }));
}

/** Omitted entirely when every medical field is empty. */
export function toMedicalInput(values: MedicalValues): MedicalInfo | undefined {
  const medical = {
    allergies: blankToUndefined(values.allergies),
    conditions: blankToUndefined(values.conditions),
    notes: blankToUndefined(values.notes),
  };
  return Object.values(medical).some(Boolean) ? medical : undefined;
}

export function guardianDefaults(guardian: Partial<GuardianInput> | null | undefined): GuardianValues {
  return {
    name: guardian?.name ?? "",
    relation: guardian?.relation ?? "",
    cnic: "",
    phone: guardian?.phone ?? "",
    email: guardian?.email ?? "",
    occupation: guardian?.occupation ?? "",
    address: guardian?.address ?? "",
  };
}
