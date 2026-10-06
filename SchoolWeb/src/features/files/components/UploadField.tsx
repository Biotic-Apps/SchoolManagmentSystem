"use client";

import { useFormContext } from "react-hook-form";
import { FileUploader } from "@/components/shared/FileUploader";
import { FormField } from "@/components/shared/FormField";
import { fieldError, fieldId } from "@/components/shared/form/field-error";
import { DOCUMENT_MAX_MB, DOCUMENT_TYPES, IMAGE_MAX_MB, IMAGE_TYPES, type FilePurpose } from "../types";
import { useUploadField } from "../use-upload-field";

const IMAGE_PURPOSES: FilePurpose[] = ["STUDENT_PHOTO", "STAFF_PHOTO", "SCHOOL_LOGO"];

interface UploadFieldProps {
  /** Form field that receives the uploaded file id. */
  name: string;
  label: string;
  purpose: FilePurpose;
  currentUrl?: string | null;
  required?: boolean;
}

/** Form field that uploads a photo or document and keeps its file id. */
export function UploadField({ name, label, purpose, currentUrl = null, required }: UploadFieldProps) {
  const { formState } = useFormContext();
  const upload = useUploadField(name, purpose, currentUrl);
  const imageOnly = IMAGE_PURPOSES.includes(purpose);
  const id = fieldId(name);

  return (
    <FormField id={id} label={label} required={required} error={fieldError(formState.errors, name)}>
      <FileUploader
        id={id}
        accept={imageOnly ? IMAGE_TYPES : DOCUMENT_TYPES}
        maxSizeMb={imageOnly ? IMAGE_MAX_MB : DOCUMENT_MAX_MB}
        previewUrl={upload.previewUrl}
        fileName={upload.fileName}
        uploading={upload.uploading}
        onUpload={upload.onUpload}
        onClear={upload.onClear}
        hint={imageOnly ? `PNG, JPG or WebP up to ${IMAGE_MAX_MB} MB.` : `PDF, Word or image up to ${DOCUMENT_MAX_MB} MB.`}
      />
    </FormField>
  );
}
