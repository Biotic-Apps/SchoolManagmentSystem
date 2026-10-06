import { useState } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { useUploadFile } from "@/features/files/api";
import type { SchoolSettingsValues } from "./school-schemas";
import type { SchoolSettings } from "./types";

interface Uploaded {
  id: string;
  url: string;
}

/** Logo upload through /files; the preview follows the form's logoFileId (so Discard restores it). */
export function useSchoolLogo(form: UseFormReturn<SchoolSettingsValues>, settings: SchoolSettings) {
  const upload = useUploadFile("SCHOOL_LOGO");
  const [uploaded, setUploaded] = useState<Uploaded | null>(null);
  const fileId = useWatch({ control: form.control, name: "logoFileId" });

  const previewUrl = !fileId
    ? null
    : fileId === uploaded?.id
      ? uploaded.url
      : fileId === settings.logoFileId
        ? settings.logoUrl
        : null;

  const onUpload = (file: File) =>
    upload.mutate(file, {
      onSuccess: (result) => {
        setUploaded({ id: result.id, url: result.url });
        form.setValue("logoFileId", result.id, { shouldDirty: true });
      },
    });

  const onClear = () => form.setValue("logoFileId", null, { shouldDirty: true });

  return { previewUrl, uploading: upload.isPending, onUpload, onClear };
}

export type SchoolLogoState = ReturnType<typeof useSchoolLogo>;
