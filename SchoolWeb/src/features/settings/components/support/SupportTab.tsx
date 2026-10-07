"use client";

import { FailedJobsSection } from "./FailedJobsSection";
import { FailedNotificationsSection } from "./FailedNotificationsSection";
import { HealthCard } from "./HealthCard";
import { TestMessageCard } from "./TestMessageCard";

interface SupportTabProps {
  schoolId: string;
  canEdit: boolean;
  showHealth: boolean;
}

export function SupportTab({ schoolId, canEdit, showHealth }: SupportTabProps) {
  return (
    <div className="flex flex-col gap-8">
      {showHealth && <HealthCard />}
      {showHealth && canEdit && <TestMessageCard />}
      <FailedNotificationsSection schoolId={schoolId} canEdit={canEdit} />
      <FailedJobsSection canEdit={canEdit} />
    </div>
  );
}
