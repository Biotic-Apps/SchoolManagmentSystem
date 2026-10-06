import { z } from "zod";
import { isoDate, requiredText, timeOfDay } from "@/lib/validation";
import type { IncidentInput, IncidentSeverity, IncidentType } from "./types";

export const incidentSchema = z.object({
  studentId: z.string().min(1, "Choose the student"),
  date: isoDate,
  time: timeOfDay,
  type: z.string().min(1, "Choose the type"),
  severity: z.string().min(1, "Choose the severity"),
  description: requiredText("what happened", 2000),
  actionTaken: requiredText("the action taken", 2000),
  attachmentFileIds: z.array(z.string()),
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
