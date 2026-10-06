import { z } from "zod";
import { blankToUndefined, optionalText, requiredText } from "@/lib/validation";
import { checkBandCoverage, hasCoverageIssues } from "./grade-bands";
import { toNumber } from "./options";
import type { GradingScheme, GradingSchemeInput } from "./types";

const percentText = z
  .string()
  .trim()
  .refine((value) => /^\d+$/.test(value) && Number(value) <= 100, { message: "use a whole number from 0 to 100" });

const bandSchema = z.object({
  grade: requiredText("a grade", 10),
  minPercent: percentText,
  maxPercent: percentText,
  remark: optionalText(60),
  gradePoint: z
    .string()
    .trim()
    .refine((value) => !value || /^\d+(\.\d{1,2})?$/.test(value), { message: "use a number like 4.0" }),
});

export const gradingSchemeSchema = z
  .object({
    name: requiredText("a name", 80),
    passPercent: percentText,
    bands: z.array(bandSchema).min(1, "Add at least one band"),
  })
  .superRefine((values, ctx) => {
    if (hasCoverageIssues(checkBandCoverage(values.bands))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["bands"], message: "Bands must cover 0–100% with no gaps or overlaps" });
    }
    const grades = values.bands.map((band) => band.grade.trim().toUpperCase());
    grades.forEach((grade, index) => {
      if (grade && grades.indexOf(grade) !== index) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["bands", index, "grade"], message: "this grade is used twice" });
      }
    });
  });

export type GradingSchemeValues = z.infer<typeof gradingSchemeSchema>;
export type BandValues = GradingSchemeValues["bands"][number];

export const emptyBand: BandValues = { grade: "", minPercent: "", maxPercent: "", remark: "", gradePoint: "" };

const text = (value: unknown) => (value === null || value === undefined ? "" : String(value));

export function gradingSchemeDefaults(scheme: GradingScheme | null): GradingSchemeValues {
  if (!scheme) return { name: "", passPercent: "33", bands: [{ ...emptyBand }] };
  return {
    name: scheme.name,
    passPercent: text(scheme.passPercent),
    bands: [...scheme.bands]
      .sort((a, b) => Number(b.minPercent) - Number(a.minPercent))
      .map((band) => ({
        grade: band.grade,
        minPercent: text(band.minPercent),
        maxPercent: text(band.maxPercent),
        remark: band.remark ?? "",
        gradePoint: text(band.gradePoint),
      })),
  };
}

export function toGradingSchemeInput(
  values: GradingSchemeValues,
  scope: { schoolId: string; sessionId: string },
): GradingSchemeInput {
  return {
    ...scope,
    name: values.name.trim(),
    passPercent: Number(values.passPercent),
    bands: values.bands.map((band) => ({
      grade: band.grade.trim(),
      minPercent: Number(band.minPercent),
      maxPercent: Number(band.maxPercent),
      remark: blankToUndefined(band.remark) ?? null,
      gradePoint: toNumber(band.gradePoint),
    })),
  };
}
