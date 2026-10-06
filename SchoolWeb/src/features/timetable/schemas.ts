import { z } from "zod";
import { isoDate, optionalText, requiredText } from "@/lib/validation";
import { formatTime } from "@/lib/time";
import { addMinutes, toMinutes } from "./time-math";
import type { OverrideInput, Period } from "./types";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Pick a time");

const periodRowSchema = z.object({
  startTime: time,
  endTime: time,
  isBreak: z.boolean(),
  label: optionalText(40),
});
export type PeriodRowValues = z.infer<typeof periodRowSchema>;

export const bellScheduleSchema = z
  .object({ periods: z.array(periodRowSchema).min(1, "Add at least one period") })
  .superRefine(({ periods }, ctx) => {
    periods.forEach((row, index) => {
      if (toMinutes(row.endTime) <= toMinutes(row.startTime)) {
        ctx.addIssue({ code: "custom", path: ["periods", index, "endTime"], message: `End after ${formatTime(row.startTime)}` });
      }
      const previous = periods[index - 1];
      if (previous && toMinutes(row.startTime) < toMinutes(previous.endTime)) {
        ctx.addIssue({
          code: "custom",
          path: ["periods", index, "startTime"],
          message: `Overlaps row ${index}; start at ${formatTime(previous.endTime)} or later`,
        });
      }
    });
  });
export type BellScheduleValues = z.infer<typeof bellScheduleSchema>;

export const bellScheduleDefaults = (periods: Period[]): BellScheduleValues => ({
  periods: [...periods]
    .sort((a, b) => a.index - b.index)
    .map((p) => ({ startTime: p.startTime, endTime: p.endTime, isBreak: p.isBreak, label: p.label ?? "" })),
});

/** A new row starts when the last one ends and lasts 40 minutes. */
export function nextPeriodRow(last: PeriodRowValues | undefined): PeriodRowValues {
  const startTime = last?.endTime ?? "08:00";
  return { startTime, endTime: addMinutes(startTime, 40), isBreak: false, label: "" };
}

export const toPeriods = (values: BellScheduleValues): Period[] =>
  values.periods.map((row, index) => ({
    index: index + 1,
    startTime: row.startTime,
    endTime: row.endTime,
    isBreak: row.isBreak,
    ...(row.label.trim() ? { label: row.label.trim() } : {}),
  }));

export const cellSchema = z.object({
  subjectId: z.string().min(1, "Choose a subject"),
  staffId: z.string().min(1, "Choose a teacher"),
  roomId: z.string(),
});
export type CellFormValues = z.infer<typeof cellSchema>;

export const overrideSchema = z.object({
  sectionId: z.string().min(1, "Choose a section"),
  date: isoDate,
  periodIndex: z.string().min(1, "Choose a period"),
  substituteStaffId: z.string().min(1, "Choose a substitute teacher"),
  reason: requiredText("a reason", 200),
});
export type OverrideFormValues = z.infer<typeof overrideSchema>;

export const toOverrideInput = (values: OverrideFormValues): OverrideInput => ({
  sectionId: values.sectionId,
  date: values.date,
  periodIndex: Number(values.periodIndex),
  substituteStaffId: values.substituteStaffId,
  reason: values.reason.trim(),
});
