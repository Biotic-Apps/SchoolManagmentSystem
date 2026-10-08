import { z } from "zod";
import { isoDate, requiredText } from "@/lib/validation";
import type { OverrideInput } from "./types";

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
