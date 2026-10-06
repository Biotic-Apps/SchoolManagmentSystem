import { HeartPulse } from "lucide-react";
import type { HealthAlert } from "@/features/health/types";
import { healthAlertText } from "../health-alert-text";

/** Small marker next to a student with allergies or medical instructions. */
export function HealthAlertIcon({ alert }: { alert: HealthAlert }) {
  const text = healthAlertText(alert);
  return (
    <span
      title={text}
      aria-label={`Health alert: ${text}`}
      role="img"
      className="grid size-6 shrink-0 place-items-center rounded-full bg-warning-soft text-warning"
    >
      <HeartPulse className="size-3.5" />
    </span>
  );
}
