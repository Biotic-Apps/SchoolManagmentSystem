import { InlineNotice } from "@/components/shared/InlineNotice";
import type { HealthAlert } from "@/features/health/types";
import { healthAlertText } from "../health-alert-text";

/** Allergy and medical instruction reminders above the roster. */
export function HealthAlertsNotice({ alerts }: { alerts: HealthAlert[] }) {
  if (alerts.length === 0) return null;
  return (
    <InlineNotice tone="warning">
      <p className="font-medium">
        {alerts.length === 1 ? "1 student has" : `${alerts.length} students have`} allergies or medical instructions
      </p>
      <ul className="mt-1 flex flex-col gap-0.5">
        {alerts.map((alert) => (
          <li key={alert.studentId}>
            <span className="font-medium">{alert.name}</span> — {healthAlertText(alert)}
          </li>
        ))}
      </ul>
    </InlineNotice>
  );
}
