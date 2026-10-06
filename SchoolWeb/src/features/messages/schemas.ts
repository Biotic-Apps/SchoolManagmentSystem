import { z } from "zod";
import { blankToUndefined, requiredText } from "@/lib/validation";
import type { NewThreadInput, SendMessageInput } from "./types";

export const composerSchema = z.object({
  body: z.string().trim().max(4000, "Use at most 4000 characters"),
  attachmentFileIds: z.array(z.string()),
});
export type ComposerValues = z.infer<typeof composerSchema>;

export const composerDefaults: ComposerValues = { body: "", attachmentFileIds: [] };

export function toSendInput(values: ComposerValues): SendMessageInput {
  return {
    body: values.body.trim(),
    attachmentFileIds: values.attachmentFileIds.length ? values.attachmentFileIds : undefined,
  };
}

export const newThreadSchema = z.object({
  studentId: z.string().min(1, "Choose a student"),
  staffUserId: z.string(),
  subject: requiredText("a subject", 150),
  body: requiredText("your message", 4000),
  attachmentFileIds: z.array(z.string()),
});
export type NewThreadValues = z.infer<typeof newThreadSchema>;

export const newThreadDefaults = (studentId: string | undefined): NewThreadValues => ({
  studentId: studentId ?? "",
  staffUserId: "",
  subject: "",
  body: "",
  attachmentFileIds: [],
});

export function toNewThreadInput(values: NewThreadValues): NewThreadInput {
  return {
    studentId: values.studentId,
    staffUserId: blankToUndefined(values.staffUserId),
    subject: values.subject.trim(),
    body: values.body.trim(),
    attachmentFileIds: values.attachmentFileIds.length ? values.attachmentFileIds : undefined,
  };
}
