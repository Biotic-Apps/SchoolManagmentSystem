import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useUploadFile } from "@/features/files/api";
import type { SchoolFormValues } from "./schemas";

/** Uploads a logo through /files and stores the file id on the school form. */
export function useLogoField(currentUrl: string | null) {
  const { setValue } = useFormContext<SchoolFormValues>();
  const upload = useUploadFile("SCHOOL_LOGO");
  const [previewUrl, setPreviewUrl] = useState(currentUrl);

  const onUpload = (file: File) =>
    upload.mutate(file, {
      onSuccess: (uploaded) => {
        setValue("logoFileId", uploaded.id, { shouldDirty: true });
        setValue("removeLogo", false);
        setPreviewUrl(uploaded.url);
      },
    });

  const onClear = () => {
    setValue("logoFileId", "", { shouldDirty: true });
    setValue("removeLogo", true);
    setPreviewUrl(null);
  };

  return { previewUrl, uploading: upload.isPending, onUpload, onClear };
}
