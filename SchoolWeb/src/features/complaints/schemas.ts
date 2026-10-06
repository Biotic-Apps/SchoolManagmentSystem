import { z } from "zod";
import { blankToUndefined, optionalText, requiredText } from "@/lib/validation";
import type { ComplaintCategory, ComplaintInput, ComplaintUpdateInput } from "./types";

export const complaintSchema = z.object({
  category: z.string().min(1, "Choose a category"),
  subject: requiredText("a subject", 150),
  description: requiredText("the details", 4000),
  studentId: z.string(),
  anonymous: z.boolean(),
  attachmentFileIds: z.array(z.string()),
});
export type ComplaintFormValues = z.infer<typeof complaintSchema>;

export const complaintDefaults = (studentId?: string | null): ComplaintFormValues => ({
  category: "",
  subject: "",
  description: "",
  studentId: studentId ?? "",
  anonymous: false,
  attachmentFileIds: [],
});

export function toComplaintInput(values: ComplaintFormValues): ComplaintInput {
  return {
    category: values.category as ComplaintCategory,
    subject: values.subject.trim(),
    description: values.description.trim(),
    studentId: blankToUndefined(values.studentId),
    anonymous: values.anonymous || undefined,
    attachmentFileIds: values.attachmentFileIds.length ? values.attachmentFileIds : undefined,
  };
}

export const complaintUpdateSchema = z.object({
  message: requiredText("the update", 4000),
  status: optionalText(20),
  attachmentFileIds: z.array(z.string()),
});
export type ComplaintUpdateValues = z.infer<typeof complaintUpdateSchema>;

export const complaintUpdateDefaults: ComplaintUpdateValues = { message: "", status: "", attachmentFileIds: [] };

export function toComplaintUpdateInput(values: ComplaintUpdateValues): ComplaintUpdateInput {
  return {
    message: values.message.trim(),
    status: (blankToUndefined(values.status) as ComplaintUpdateInput["status"]) ?? undefined,
    attachmentFileIds: values.attachmentFileIds.length ? values.attachmentFileIds : undefined,
  };
}

export const assignSchema = z.object({ assigneeUserId: z.string().min(1, "Choose who handles it") });
export type AssignValues = z.infer<typeof assignSchema>;
