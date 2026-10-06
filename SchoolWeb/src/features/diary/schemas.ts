import { z } from "zod";
import { blankToUndefined, optionalIsoDate, optionalText, requiredText } from "@/lib/validation";
import type { DiaryEntry, DiaryInput } from "./types";

export const diarySchema = z
  .object({
    subjectId: z.string().min(1, "Choose a subject"),
    topics: requiredText("the topics covered", 2000),
    homework: optionalText(2000),
    dueDate: optionalIsoDate,
    attachmentFileIds: z.array(z.string()),
  })
  .refine((values) => !values.dueDate || !!values.homework.trim(), {
    path: ["dueDate"],
    message: "Add the homework first",
  });
export type DiaryFormValues = z.infer<typeof diarySchema>;

export const diaryDefaults = (entry: DiaryEntry | null): DiaryFormValues => ({
  subjectId: entry?.subject.id ?? "",
  topics: entry?.topics ?? "",
  homework: entry?.homework ?? "",
  dueDate: entry?.dueDate ?? "",
  attachmentFileIds: entry?.attachments.map((file) => file.id) ?? [],
});

export function toDiaryInput(values: DiaryFormValues, context: { sectionId: string; date: string }): DiaryInput {
  return {
    sectionId: context.sectionId,
    date: context.date,
    subjectId: values.subjectId,
    topics: values.topics.trim(),
    homework: blankToUndefined(values.homework),
    dueDate: blankToUndefined(values.dueDate),
    attachmentFileIds: values.attachmentFileIds,
  };
}
