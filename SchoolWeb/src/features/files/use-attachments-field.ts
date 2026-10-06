import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useUploadFile } from "./api";
import { DOCUMENT_MAX_MB, DOCUMENT_TYPES, type Attachment } from "./types";

/** Uploads files as ATTACHMENT and keeps their ids in a string[] form field. */
export function useAttachmentsField(name: string, initial: Attachment[] = [], max = 5) {
  const { setValue } = useFormContext();
  const upload = useUploadFile("ATTACHMENT");
  const [items, setItems] = useState<Attachment[]>(initial);
  const [error, setError] = useState<string | null>(null);

  const sync = (next: Attachment[]) => {
    setItems(next);
    setValue(name, next.map((item) => item.id), { shouldDirty: true });
  };

  const onFile = (file: File) => {
    if (!DOCUMENT_TYPES.includes(file.type)) return setError("This file type is not allowed.");
    if (file.size > DOCUMENT_MAX_MB * 1024 * 1024) return setError(`Each file must be ${DOCUMENT_MAX_MB} MB or smaller.`);
    setError(null);
    upload.mutate(file, {
      onSuccess: (uploaded) => sync([...items, { id: uploaded.id, url: uploaded.url, mime: uploaded.mime, name: file.name }]),
    });
  };

  return {
    items,
    error,
    uploading: upload.isPending,
    canAdd: items.length < max,
    onFile,
    remove: (id: string) => sync(items.filter((item) => item.id !== id)),
  };
}
