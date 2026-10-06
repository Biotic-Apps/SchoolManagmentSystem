import { useServerForm } from "@/lib/use-server-form";
import { useAddDocument } from "./api";
import { documentSchema, EMPTY_DOCUMENT, toDocumentInput, type DocumentFormValues } from "./schemas";
import type { DocumentOwnerType } from "./types";

export function useDocumentUploadForm(ownerType: DocumentOwnerType, ownerId: string, onDone: () => void) {
  const add = useAddDocument(ownerType, ownerId);
  return useServerForm<DocumentFormValues>({
    schema: documentSchema,
    defaultValues: EMPTY_DOCUMENT,
    onSubmit: (values) => add.mutateAsync(toDocumentInput(values)),
    onSuccess: onDone,
  });
}
