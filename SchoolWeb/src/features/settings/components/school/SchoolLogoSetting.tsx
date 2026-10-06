"use client";

import { FileUploader } from "@/components/shared/FileUploader";
import { Label } from "@/components/ui/Label";
import { IMAGE_MAX_MB, IMAGE_TYPES } from "@/features/files/types";
import type { SchoolLogoState } from "../../use-school-logo";

export function SchoolLogoSetting({ logo }: { logo: SchoolLogoState }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="settings-school-logo">Logo</Label>
      <FileUploader
        id="settings-school-logo"
        accept={IMAGE_TYPES}
        maxSizeMb={IMAGE_MAX_MB}
        previewUrl={logo.previewUrl}
        uploading={logo.uploading}
        onUpload={logo.onUpload}
        onClear={logo.onClear}
        hint={`Square image works best. PNG, JPG or WebP up to ${IMAGE_MAX_MB} MB.`}
      />
    </div>
  );
}
