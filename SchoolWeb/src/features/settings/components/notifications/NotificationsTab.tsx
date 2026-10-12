"use client";

import { UnsavedChangesGuard } from "@/components/shared/UnsavedChangesGuard";
import { useNotificationSettings } from "../../settings-api";
import { SettingsQueryState } from "../SettingsQueryState";
import { NotificationSettingsForm } from "./NotificationSettingsForm";
import { WhatsAppLogSection } from "./WhatsAppLogSection";

interface NotificationsTabProps {
  schoolId: string;
  canEdit: boolean;
}

export function NotificationsTab({ schoolId, canEdit }: NotificationsTabProps) {
  const query = useNotificationSettings(schoolId);
  if (!query.data) {
    return <SettingsQueryState isPending={query.isPending} error={query.error} onRetry={() => query.refetch()} />;
  }
  return (
    <div className="flex flex-col gap-8">
      <UnsavedChangesGuard>
        <NotificationSettingsForm key={schoolId} schoolId={schoolId} settings={query.data} canEdit={canEdit} />
      </UnsavedChangesGuard>
      <WhatsAppLogSection schoolId={schoolId} />
    </div>
  );
}
