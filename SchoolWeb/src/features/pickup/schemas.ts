import { z } from "zod";
import { blankToUndefined, isoDate, optionalText, requiredText, timeOfDay } from "@/lib/validation";
import type { DepartureInput, EarlyLeaveInput, PickupPersonInput } from "./types";

export const earlyLeaveSchema = z.object({
  studentId: z.string().min(1, "Choose the student"),
  date: isoDate,
  time: timeOfDay,
  reason: requiredText("the reason", 500),
  pickupPersonId: z.string(),
});
export type EarlyLeaveValues = z.infer<typeof earlyLeaveSchema>;

export function earlyLeaveDefaults(studentId: string, date: string): EarlyLeaveValues {
  return { studentId, date, time: "12:00", reason: "", pickupPersonId: "" };
}

export function toEarlyLeaveInput(values: EarlyLeaveValues): EarlyLeaveInput {
  return {
    studentId: values.studentId,
    date: values.date,
    time: values.time,
    reason: values.reason.trim(),
    pickupPersonId: blankToUndefined(values.pickupPersonId),
  };
}

export const pickupPersonSchema = z.object({
  name: requiredText("the name", 120),
  relation: requiredText("the relation", 60),
  cnic: optionalText(20).refine((value) => !value || /^\d{5}-?\d{7}-?\d$/.test(value), {
    message: "Use the 13-digit CNIC, e.g. 35202-1234567-1",
  }),
  phone: requiredText("the phone number", 20).refine((value) => /^\+?[0-9\s-]{7,20}$/.test(value), {
    message: "Enter a valid phone number",
  }),
  photoFileId: z.string(),
});
export type PickupPersonValues = z.infer<typeof pickupPersonSchema>;

export const PICKUP_PERSON_DEFAULTS: PickupPersonValues = { name: "", relation: "", cnic: "", phone: "", photoFileId: "" };

export function toPickupPersonInput(values: PickupPersonValues): PickupPersonInput {
  return {
    name: values.name.trim(),
    relation: values.relation.trim(),
    cnic: blankToUndefined(values.cnic),
    phone: values.phone.trim(),
    photoFileId: blankToUndefined(values.photoFileId),
  };
}

/** Picker choice is "person:<id>" or "guardian:<id>". */
export const departureSchema = z.object({
  studentId: z.string().min(1, "Choose the student"),
  picker: z.string().min(1, "Choose who is collecting the student"),
  earlyLeaveId: z.string(),
  customTime: z.boolean(),
  time: timeOfDay,
});
export type DepartureValues = z.infer<typeof departureSchema>;

export function departureDefaults(now: string): DepartureValues {
  return { studentId: "", picker: "", earlyLeaveId: "", customTime: false, time: now };
}

export function pickerValue(kind: "person" | "guardian", id: string): string {
  return `${kind}:${id}`;
}

export function toDepartureInput(values: DepartureValues, date: string): DepartureInput {
  const [kind, id] = values.picker.split(":");
  return {
    studentId: values.studentId,
    earlyLeaveId: blankToUndefined(values.earlyLeaveId),
    pickedUpBy: kind === "guardian" ? { guardianId: id } : { pickupPersonId: id },
    at: values.customTime ? new Date(`${date}T${values.time}:00`).toISOString() : undefined,
  };
}
