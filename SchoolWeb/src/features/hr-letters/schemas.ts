import { z } from "zod";
import { optionalText } from "@/lib/validation";
import type { GenerateHrLetterInput } from "./types";

export const generateLetterSchema = z.object({
  templateId: z.string().min(1, "Choose a template"),
  subject: optionalText(200),
  effectiveDate: z.string().refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), { message: "Pick a date" }),
});

export type GenerateLetterFormValues = z.infer<typeof generateLetterSchema>;

export const generateLetterDefaults = (): GenerateLetterFormValues => ({
  templateId: "",
  subject: "",
  effectiveDate: "",
});

export function toGenerateInput(values: GenerateLetterFormValues): GenerateHrLetterInput {
  return {
    templateId: values.templateId,
    subject: values.subject.trim() || undefined,
    effectiveDate: values.effectiveDate || undefined,
  };
}
