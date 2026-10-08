import { z } from "zod";
import { formatTime } from "@/lib/time";
import { generateBell, DEFAULT_BELL, type BellRow } from "./bell-generator";
import type { BellSchedule, BellScheduleInput, PeriodInput } from "./builder-types";
import { addMinutes, toMinutes } from "./time-math";
import type { Period } from "./types";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Pick a time");

const rowSchema = z.object({
  startTime: time,
  endTime: time,
  isBreak: z.boolean(),
  label: z.string().trim().max(40, "Use at most 40 characters"),
});

const daySchema = z.object({ day: z.number().int().min(0).max(7), rows: z.array(rowSchema).min(1, "Add at least one period") });

/** schedules[0] is the default (day 0); the rest are weekday-specific (e.g. day 5 = Friday). */
export const bellFormSchema = z.object({ schedules: z.array(daySchema).min(1) }).superRefine(({ schedules }, ctx) => {
  schedules.forEach((schedule, s) => {
    schedule.rows.forEach((row, index) => {
      const path = ["schedules", s, "rows", index];
      if (toMinutes(row.endTime) <= toMinutes(row.startTime)) {
        ctx.addIssue({ code: "custom", path: [...path, "endTime"], message: `End after ${formatTime(row.startTime)}` });
      }
      const previous = schedule.rows[index - 1];
      if (previous && toMinutes(row.startTime) < toMinutes(previous.endTime)) {
        ctx.addIssue({ code: "custom", path: [...path, "startTime"], message: `Start at ${formatTime(previous.endTime)} or later` });
      }
    });
  });
});

export type BellFormValues = z.infer<typeof bellFormSchema>;

const toRow = (period: Period): BellRow => ({
  startTime: period.startTime,
  endTime: period.endTime,
  isBreak: period.isBreak,
  label: period.isBreak ? (period.label ?? "Break") : "",
});

const sorted = (periods: Period[]) => [...periods].sort((a, b) => a.index - b.index).map(toRow);

export function bellFormDefaults(bell: BellSchedule | null): BellFormValues {
  const base = bell?.default.length ? sorted(bell.default) : generateBell(DEFAULT_BELL);
  const days = Object.entries(bell?.days ?? {})
    .filter(([, rows]) => rows.length > 0)
    .map(([day, rows]) => ({ day: Number(day), rows: sorted(rows) }));
  return { schedules: [{ day: 0, rows: base }, ...days.sort((a, b) => a.day - b.day)] };
}

const toInputs = (rows: BellRow[]): PeriodInput[] =>
  rows.map((row, index) => ({
    index: index + 1,
    startTime: row.startTime,
    endTime: row.endTime,
    isBreak: row.isBreak,
    // Labels only mean something on breaks (contract D5).
    ...(row.isBreak ? { label: row.label.trim() || "Break" } : {}),
  }));

export function toBellInput(values: BellFormValues, dropLessons = false): BellScheduleInput {
  const [base, ...days] = values.schedules;
  return {
    default: toInputs(base.rows),
    days: Object.fromEntries(days.map((schedule) => [String(schedule.day), toInputs(schedule.rows)])),
    ...(dropLessons ? { dropLessons: true } : {}),
  };
}

/** A new row starts when the last one ends and lasts as long as it did (40 minutes for the first). */
export function nextRow(last: BellRow | undefined): BellRow {
  const startTime = last?.endTime ?? "08:00";
  const length = last && !last.isBreak ? toMinutes(last.endTime) - toMinutes(last.startTime) : 40;
  return { startTime, endTime: addMinutes(startTime, length), isBreak: false, label: "" };
}
