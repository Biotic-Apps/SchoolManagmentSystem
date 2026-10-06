import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useUploadFile } from "./api";
import type { FilePurpose } from "./types";

/** Uploads through POST /files and stores the returned file id in a form field. */
export function useUploadField(name: string, purpose: FilePurpose, currentUrl: string | null) {
  const { setValue } = useFormContext();
  const upload = useUploadFile(purpose);
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const [fileName, setFileName] = useState<string | null>(null);

  const onUpload = (file: File) =>
    upload.mutate(file, {
      onSuccess: (uploaded) => {
        setValue(name, uploaded.id, { shouldDirty: true, shouldValidate: true });
        const isImage = uploaded.mime.startsWith("image/");
        setPreviewUrl(isImage ? uploaded.url : null);
        setFileName(isImage ? null : file.name);
      },
    });

  const onClear = () => {
    setValue(name, "", { shouldDirty: true, shouldValidate: true });
    setPreviewUrl(null);
    setFileName(null);
  };

  return { previewUrl, fileName, uploading: upload.isPending, onUpload, onClear };
}
