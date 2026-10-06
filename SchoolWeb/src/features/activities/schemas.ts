import { z } from "zod";
import { blankToUndefined, isoDate, optionalIsoDate, optionalText, requiredText, timeOfDay } from "@/lib/validation";
import { localParts } from "./options";
import type { Activity, ActivityInput, ActivityType } from "./types";

const money = z
  .string()
  .trim()
  .refine((value) => !value || (/^\d+(\.\d{1,2})?$/.test(value) && Number(value) >= 0), {
    message: "Enter the fee in rupees, e.g. 500",
  });

const count = z
  .string()
  .trim()
  .refine((value) => !value || (/^\d+$/.test(value) && Number(value) > 0), { message: "Enter a whole number" });

export const activitySchema = z
  .object({
    type: z.enum(["EVENT", "SPORTS", "TRIP", "COMPETITION", "CLUB"], { message: "Choose a type" }),
    title: requiredText("a title", 150),
    description: requiredText("a description", 3000),
    startDate: isoDate,
    startTime: timeOfDay,
    endDate: isoDate,
    endTime: timeOfDay,
    venue: optionalText(150),
    wholeBranch: z.boolean(),
    classIds: z.array(z.string()),
    sectionIds: z.array(z.string()),
    consentRequired: z.boolean(),
    consentDeadline: optionalIsoDate,
    fee: money,
    maxParticipants: count,
  })
  .refine((v) => `${v.endDate}T${v.endTime}` > `${v.startDate}T${v.startTime}`, {
    path: ["endDate"],
    message: "End must be after the start",
  })
  .refine((v) => v.wholeBranch || v.classIds.length + v.sectionIds.length > 0, {
    path: ["wholeBranch"],
    message: "Choose the whole branch, or some classes or sections",
  })
  .refine((v) => !v.consentRequired || !!v.consentDeadline, {
    path: ["consentDeadline"],
    message: "Set the last day for consent",
  })
  .refine((v) => !v.consentRequired || !v.consentDeadline || v.consentDeadline <= v.startDate, {
    path: ["consentDeadline"],
    message: "The deadline must be on or before the start date",
  });
export type ActivityFormValues = z.infer<typeof activitySchema>;

export function activityDefaults(activity: Activity | null, today: string): ActivityFormValues {
  const start = activity ? localParts(activity.startAt) : { date: today, time: "09:00" };
  const end = activity ? localParts(activity.endAt) : { date: today, time: "12:00" };
  return {
    type: activity?.type ?? ("" as ActivityType),
    title: activity?.title ?? "",
    description: activity?.description ?? "",
    startDate: start.date,
    startTime: start.time,
    endDate: end.date,
    endTime: end.time,
    venue: activity?.venue ?? "",
    wholeBranch: activity?.audience.wholeBranch ?? false,
    classIds: activity?.audience.classIds ?? [],
    sectionIds: activity?.audience.sectionIds ?? [],
    consentRequired: activity?.consentRequired ?? false,
    consentDeadline: activity?.consentDeadline?.slice(0, 10) ?? "",
    fee: activity?.feeMinor ? String(activity.feeMinor / 100) : "",
    maxParticipants: activity?.maxParticipants ? String(activity.maxParticipants) : "",
  };
}

/** Date + 12h-picked time are local school time; the API takes ISO instants. */
const toInstant = (date: string, time: string) => new Date(`${date}T${time}:00`).toISOString();

export function toActivityInput(values: ActivityFormValues, branchId: string): ActivityInput {
  return {
    branchId,
    type: values.type,
    title: values.title.trim(),
    description: values.description.trim(),
    startAt: toInstant(values.startDate, values.startTime),
    endAt: toInstant(values.endDate, values.endTime),
    venue: blankToUndefined(values.venue),
    audience: values.wholeBranch
      ? { wholeBranch: true }
      : { classIds: values.classIds, sectionIds: values.sectionIds },
    consentRequired: values.consentRequired,
    consentDeadline: values.consentRequired ? blankToUndefined(values.consentDeadline) : undefined,
    feeMinor: values.fee ? Math.round(Number(values.fee) * 100) : undefined,
    maxParticipants: values.maxParticipants ? Number(values.maxParticipants) : undefined,
  };
}
