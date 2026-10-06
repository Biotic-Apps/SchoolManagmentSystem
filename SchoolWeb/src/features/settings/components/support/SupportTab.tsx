"use client";

import { FailedJobsSection } from "./FailedJobsSection";
import { FailedNotificationsSection } from "./FailedNotificationsSection";
import { HealthCard } from "./HealthCard";

interface SupportTabProps {
  schoolId: string;
  canEdit: boolean;
  showHealth: boolean;
}

export function SupportTab({ schoolId, canEdit, showHealth }: SupportTabProps) {
  return (
    <div className="flex flex-col gap-8">
      {showHealth && <HealthCard />}
      <FailedNotificationsSection schoolId={schoolId} canEdit={canEdit} />
      <FailedJobsSection canEdit={canEdit} />
    </div>
  );
}
