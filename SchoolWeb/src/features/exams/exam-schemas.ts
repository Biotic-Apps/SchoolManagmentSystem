import { z } from "zod";
import { blankToUndefined, requiredText } from "@/lib/validation";
import type { Exam, ExamInput, ExamType } from "./types";

export const examSchema = z.object({
  name: requiredText("a name", 100),
  type: z.string().min(1, "Choose a type"),
  gradingSchemeId: z.string().min(1, "Choose a grading scheme"),
  termId: z.string(),
  weightPercent: z
    .string()
    .trim()
    .refine((value) => !value || (/^\d+$/.test(value) && Number(value) <= 100), {
      message: "Enter a whole percent from 0 to 100",
    }),
  classIds: z.array(z.string()).min(1, "Pick at least one class"),
});

export type ExamFormValues = z.infer<typeof examSchema>;

export function examDefaults(exam: Exam | null): ExamFormValues {
  return {
    name: exam?.name ?? "",
    type: exam?.type ?? "",
    gradingSchemeId: exam?.gradingSchemeId ?? "",
    termId: exam?.termId ?? "",
    weightPercent: exam?.weightPercent != null ? String(exam.weightPercent) : "",
    classIds: exam?.classIds ?? exam?.classes?.map((item) => item.id) ?? [],
  };
}

export function toExamInput(values: ExamFormValues, scope: { branchId: string; sessionId: string }): ExamInput {
  const weight = blankToUndefined(values.weightPercent);
  return {
    ...scope,
    name: values.name.trim(),
    type: values.type as ExamType,
    gradingSchemeId: values.gradingSchemeId,
    termId: blankToUndefined(values.termId),
    weightPercent: weight === undefined ? undefined : Number(weight),
    classIds: values.classIds,
  };
}
