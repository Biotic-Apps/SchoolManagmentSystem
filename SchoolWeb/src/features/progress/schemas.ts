import { z } from "zod";
import { requiredText } from "@/lib/validation";
import type { ProgressCategory, ProgressNoteInput } from "./types";

export const noteSchema = z.object({
  category: z.string().min(1, "Choose a category"),
  note: requiredText("the note", 2000),
  visibleToParent: z.boolean(),
});
export type NoteFormValues = z.infer<typeof noteSchema>;

export const noteDefaults: NoteFormValues = { category: "", note: "", visibleToParent: true };

export function toNoteInput(values: NoteFormValues): ProgressNoteInput {
  return {
    category: values.category as ProgressCategory,
    note: values.note.trim(),
    visibleToParent: values.visibleToParent,
  };
}
