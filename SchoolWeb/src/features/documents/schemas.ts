import { z } from "zod";
import { blankToUndefined, optionalText } from "@/lib/validation";
import type { DocType, DocumentInput } from "./types";

export const documentSchema = z.object({
  docType: z.string().min(1, "Choose the document type"),
  fileId: z.string().min(1, "Upload the file"),
  note: optionalText(255),
});
export type DocumentFormValues = z.infer<typeof documentSchema>;

export const EMPTY_DOCUMENT: DocumentFormValues = { docType: "", fileId: "", note: "" };

export function toDocumentInput(values: DocumentFormValues): DocumentInput {
  return { docType: values.docType as DocType, fileId: values.fileId, note: blankToUndefined(values.note) };
}
