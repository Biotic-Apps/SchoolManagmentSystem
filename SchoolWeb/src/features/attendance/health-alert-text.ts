import type { HealthAlert } from "@/features/health/types";

export function healthAlertText(alert: HealthAlert): string {
  const allergies = alert.allergies.map((item) => `${item.name} (${item.severity.toLowerCase()})`).join(", ");
  return [
    allergies && `Allergies: ${allergies}`,
    alert.conditions?.length ? `Conditions: ${alert.conditions.join(", ")}` : "",
    alert.instructions && `Instructions: ${alert.instructions}`,
  ]
    .filter(Boolean)
    .join(". ");
}
