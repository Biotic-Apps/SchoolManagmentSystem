import { z } from "zod";

export interface DateRange {
  startDate: string;
  endDate: string;
}

export function rangesOverlap(a: DateRange, b: DateRange): boolean {
  return a.startDate <= b.endDate && b.startDate <= a.endDate;
}

/** Adds "end on or after start" to an object schema with startDate/endDate. */
export function refineEndAfterStart(value: DateRange, ctx: z.RefinementCtx) {
  if (value.startDate && value.endDate && value.endDate < value.startDate) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["endDate"], message: "End date must be on or after the start date" });
  }
}
