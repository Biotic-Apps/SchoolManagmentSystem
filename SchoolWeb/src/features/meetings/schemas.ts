import { z } from "zod";
import { addDays, todayIso } from "@/lib/dates";
import { blankToUndefined, isoDate, optionalText, requiredText, timeOfDay } from "@/lib/validation";
import type { AcceptMeetingInput, CompleteMeetingInput, MeetingMode, SlotInput, StaffMeetingInput } from "./types";

const endAfterStart = (value: { startTime: string; endTime: string }) => value.endTime > value.startTime;
const END_MESSAGE = { message: "End time must be after the start time", path: ["endTime"] };

const slotRow = z
  .object({
    date: isoDate,
    startTime: timeOfDay,
    endTime: timeOfDay,
    mode: z.string().min(1, "Choose a mode"),
    location: optionalText(120),
  })
  .refine(endAfterStart, END_MESSAGE);

export const slotsSchema = z.object({ slots: z.array(slotRow).min(1, "Add at least one slot") });
export type SlotsFormValues = z.infer<typeof slotsSchema>;
export type SlotRowValues = SlotsFormValues["slots"][number];

export const slotRowDefaults = (date = todayIso()): SlotRowValues => ({
  date,
  startTime: "13:00",
  endTime: "13:15",
  mode: "IN_PERSON",
  location: "",
});

export function toSlotInputs(values: SlotsFormValues): SlotInput[] {
  return values.slots.map((slot) => ({
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    mode: slot.mode as MeetingMode,
    location: blankToUndefined(slot.location),
  }));
}

const followUpRow = z.object({
  title: requiredText("the follow-up", 200),
  ownerUserId: z.string().min(1, "Choose an owner"),
  dueDate: isoDate,
});

export const completeSchema = z
  .object({
    notes: requiredText("the meeting notes", 4000),
    shareSummaryWithParent: z.boolean(),
    summary: optionalText(4000),
    followUps: z.array(followUpRow),
  })
  .refine((value) => !value.shareSummaryWithParent || !!value.summary.trim(), {
    message: "Write the summary the parent will see",
    path: ["summary"],
  });
export type CompleteFormValues = z.infer<typeof completeSchema>;

export const completeDefaults: CompleteFormValues = {
  notes: "",
  shareSummaryWithParent: false,
  summary: "",
  followUps: [],
};

export function toCompleteInput(values: CompleteFormValues): CompleteMeetingInput {
  return {
    notes: values.notes.trim(),
    shareSummaryWithParent: values.shareSummaryWithParent,
    summary: values.shareSummaryWithParent ? values.summary.trim() : undefined,
    followUps: values.followUps.length
      ? values.followUps.map((item) => ({ ...item, title: item.title.trim() }))
      : undefined,
  };
}

export const requestSchema = z
  .object({
    studentId: z.string().min(1, "Choose a student"),
    guardianId: z.string().min(1, "Choose a guardian"),
    date: isoDate,
    startTime: timeOfDay,
    endTime: timeOfDay,
    mode: z.string().min(1, "Choose a mode"),
    agenda: requiredText("the agenda", 1000),
  })
  .refine(endAfterStart, END_MESSAGE);
export type RequestFormValues = z.infer<typeof requestSchema>;

export const requestDefaults = (): RequestFormValues => ({
  studentId: "",
  guardianId: "",
  date: todayIso(),
  startTime: "13:00",
  endTime: "13:30",
  mode: "IN_PERSON",
  agenda: "",
});

export function toRequestInput(values: RequestFormValues): StaffMeetingInput {
  return { ...values, mode: values.mode as MeetingMode, agenda: values.agenda.trim() };
}

/** One form for both ways a parent asks: an open slot, or a suggested time. */
export const bookingSchema = z
  .object({
    kind: z.enum(["slot", "request"]),
    slotId: z.string(),
    date: z.string(),
    startTime: z.string(),
    mode: z.string(),
    agenda: requiredText("what you'd like to discuss", 1000),
  })
  .superRefine((value, ctx) => {
    const issue = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });
    if (value.kind === "slot") {
      if (!value.slotId) issue("slotId", "Pick a time");
      return;
    }
    if (!isoDate.safeParse(value.date).success) issue("date", "Pick a date");
    else if (value.date < todayIso()) issue("date", "Pick today or a later date");
    if (!timeOfDay.safeParse(value.startTime).success) issue("startTime", "Pick a time");
    if (!value.mode) issue("mode", "Choose a mode");
  });
export type BookingFormValues = z.infer<typeof bookingSchema>;

export const bookingDefaults = (): BookingFormValues => ({
  kind: "slot",
  slotId: "",
  date: addDays(todayIso(), 1),
  startTime: "13:00",
  mode: "IN_PERSON",
  agenda: "",
});

export const acceptSchema = z
  .object({
    date: isoDate.refine((value) => value >= todayIso(), "Pick today or a later date"),
    startTime: timeOfDay,
    endTime: timeOfDay,
    mode: z.string().min(1, "Choose a mode"),
    location: optionalText(120),
  })
  .refine(endAfterStart, END_MESSAGE);
export type AcceptFormValues = z.infer<typeof acceptSchema>;

export function toAcceptInput(values: AcceptFormValues): AcceptMeetingInput {
  return { ...values, mode: values.mode as MeetingMode, location: blankToUndefined(values.location) };
}
