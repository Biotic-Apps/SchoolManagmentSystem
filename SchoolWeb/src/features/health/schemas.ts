import { z } from "zod";
import { todayIso } from "@/lib/dates";
import { isoDate, requiredText, timeOfDay } from "@/lib/validation";
import type { IncidentInput, IncidentSeverity, IncidentType } from "./types";

const CLOCK_SKEW_MS = 5 * 60_000;

export const incidentSchema = z
  .object({
    studentId: z.string().min(1, "Choose the student"),
    date: isoDate.refine((value) => value <= todayIso(), "The date cannot be in the future"),
    time: timeOfDay,
    type: z.string().min(1, "Choose the type"),
    severity: z.string().min(1, "Choose the severity"),
    description: requiredText("what happened", 2000),
    actionTaken: requiredText("the action taken", 2000),
    attachmentFileIds: z.array(z.string()),
  })
  // Mirrors the API: an incident is reported after it happened.
  .refine((values) => new Date(`${values.date}T${values.time}:00`).getTime() <= Date.now() + CLOCK_SKEW_MS, {
    path: ["time"],
    message: "The time cannot be in the future",
  });
export type IncidentFormValues = z.infer<typeof incidentSchema>;

export function incidentDefaults(today: string, now: string): IncidentFormValues {
  return {
    studentId: "",
    date: today,
    time: now,
    type: "",
    severity: "",
    description: "",
    actionTaken: "",
    attachmentFileIds: [],
  };
}

/** School-local date + time → ISO instant. */
export function toIsoInstant(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

export function toIncidentInput(values: IncidentFormValues): IncidentInput {
  return {
    studentId: values.studentId,
    occurredAt: toIsoInstant(values.date, values.time),
    type: values.type as IncidentType,
    severity: values.severity as IncidentSeverity,
    description: values.description.trim(),
    actionTaken: values.actionTaken.trim(),
    attachmentFileIds: values.attachmentFileIds.length ? values.attachmentFileIds : undefined,
  };
}
