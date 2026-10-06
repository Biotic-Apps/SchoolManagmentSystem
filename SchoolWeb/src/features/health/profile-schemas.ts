import { z } from "zod";
import { blankToNull, optionalPhone, optionalText, requiredText } from "@/lib/validation";
import type { HealthProfile, HealthProfileInput } from "./types";

const allergySchema = z.object({
  name: requiredText("the allergy", 120),
  severity: z.string().min(1, "Choose the severity"),
  reaction: optionalText(255),
});

const medicationSchema = z.object({
  name: requiredText("the medicine", 120),
  dose: optionalText(120),
  schedule: optionalText(120),
});

const contactSchema = z.object({
  name: requiredText("the name", 120),
  relation: requiredText("the relation", 60),
  phone: requiredText("the phone number", 20).pipe(optionalPhone),
});

export const healthProfileSchema = z
  .object({
    bloodGroup: z.string(),
    allergies: z.array(allergySchema),
    conditions: z.array(z.object({ value: requiredText("the condition", 120) })),
    medications: z.array(medicationSchema),
    instructions: optionalText(2000),
    doctorName: optionalText(120),
    doctorPhone: optionalPhone,
    emergencyContacts: z.array(contactSchema),
  })
  .refine((values) => !values.doctorName.trim() || !!values.doctorPhone.trim(), {
    path: ["doctorPhone"],
    message: "Enter the doctor's phone number",
  });
export type HealthProfileValues = z.infer<typeof healthProfileSchema>;

export const EMPTY_ALLERGY = { name: "", severity: "", reaction: "" };
export const EMPTY_CONDITION = { value: "" };
export const EMPTY_MEDICATION = { name: "", dose: "", schedule: "" };
export const EMPTY_CONTACT = { name: "", relation: "", phone: "" };

export function healthProfileDefaults(profile: HealthProfile | null | undefined): HealthProfileValues {
  return {
    bloodGroup: profile?.bloodGroup ?? "",
    allergies: (profile?.allergies ?? []).map((item) => ({
      name: item.name,
      severity: item.severity ?? "",
      reaction: item.reaction ?? "",
    })),
    conditions: (profile?.conditions ?? []).map((value) => ({ value })),
    medications: (profile?.medications ?? []).map((item) => ({
      name: item.name,
      dose: item.dose ?? "",
      schedule: item.schedule ?? "",
    })),
    instructions: profile?.instructions ?? "",
    doctorName: profile?.doctor?.name ?? "",
    doctorPhone: profile?.doctor?.phone ?? "",
    emergencyContacts: [...(profile?.emergencyContacts ?? [])]
      .sort((a, b) => a.priority - b.priority)
      .map(({ name, relation, phone }) => ({ name, relation, phone })),
  };
}

export function toHealthProfileInput(values: HealthProfileValues): HealthProfileInput {
  const doctorName = values.doctorName.trim();
  return {
    bloodGroup: blankToNull(values.bloodGroup),
    allergies: values.allergies.map((item) => ({
      name: item.name.trim(),
      severity: item.severity,
      reaction: blankToNull(item.reaction),
    })),
    conditions: values.conditions.map((item) => item.value.trim()),
    medications: values.medications.map((item) => ({
      name: item.name.trim(),
      dose: blankToNull(item.dose),
      schedule: blankToNull(item.schedule),
    })),
    instructions: blankToNull(values.instructions),
    doctor: doctorName ? { name: doctorName, phone: values.doctorPhone.trim() } : null,
    emergencyContacts: values.emergencyContacts.map((item, index) => ({
      name: item.name.trim(),
      relation: item.relation.trim(),
      phone: item.phone.trim(),
      priority: index + 1,
    })),
  };
}
