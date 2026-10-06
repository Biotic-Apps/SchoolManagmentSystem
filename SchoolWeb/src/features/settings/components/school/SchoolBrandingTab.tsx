"use client";

import { UnsavedChangesGuard } from "@/components/shared/UnsavedChangesGuard";
import { useSchoolSettings } from "../../settings-api";
import { SettingsQueryState } from "../SettingsQueryState";
import { SchoolSettingsForm } from "./SchoolSettingsForm";

interface SchoolBrandingTabProps {
  schoolId: string;
  canEdit: boolean;
}

export function SchoolBrandingTab({ schoolId, canEdit }: SchoolBrandingTabProps) {
  const query = useSchoolSettings(schoolId);
  if (!query.data) {
    return <SettingsQueryState isPending={query.isPending} error={query.error} onRetry={() => query.refetch()} />;
  }
  return (
    <UnsavedChangesGuard>
      <SchoolSettingsForm key={schoolId} schoolId={schoolId} settings={query.data} canEdit={canEdit} />
    </UnsavedChangesGuard>
  );
}
