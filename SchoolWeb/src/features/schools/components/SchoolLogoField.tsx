"use client";

import { FileUploader } from "@/components/shared/FileUploader";
import { Label } from "@/components/ui/Label";
import { IMAGE_MAX_MB, IMAGE_TYPES } from "@/features/files/types";
import { useLogoField } from "../use-logo-field";

export function SchoolLogoField({ currentUrl }: { currentUrl: string | null }) {
  const logo = useLogoField(currentUrl);
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="school-logo">Logo</Label>
      <FileUploader
        id="school-logo"
        accept={IMAGE_TYPES}
        maxSizeMb={IMAGE_MAX_MB}
        previewUrl={logo.previewUrl}
        uploading={logo.uploading}
        onUpload={logo.onUpload}
        onClear={logo.onClear}
        hint={`PNG, JPG or WebP up to ${IMAGE_MAX_MB} MB.`}
      />
    </div>
  );
}
