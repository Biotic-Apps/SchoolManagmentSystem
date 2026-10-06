"use client";

import { UnsavedChangesGuard } from "@/components/shared/UnsavedChangesGuard";
import { usePolicySettings } from "../../settings-api";
import { SettingsQueryState } from "../SettingsQueryState";
import { PolicySettingsForm } from "./PolicySettingsForm";

interface PoliciesTabProps {
  schoolId: string;
  canEdit: boolean;
}

export function PoliciesTab({ schoolId, canEdit }: PoliciesTabProps) {
  const query = usePolicySettings(schoolId);
  if (!query.data) {
    return <SettingsQueryState isPending={query.isPending} error={query.error} onRetry={() => query.refetch()} />;
  }
  return (
    <UnsavedChangesGuard>
      <PolicySettingsForm key={schoolId} schoolId={schoolId} settings={query.data} canEdit={canEdit} />
    </UnsavedChangesGuard>
  );
}
