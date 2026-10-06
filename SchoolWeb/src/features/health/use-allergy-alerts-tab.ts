import { useSectionScope } from "@/features/classes/use-section-scope";
import { useHealthAlerts } from "./alerts-api";

export function useAllergyAlertsTab() {
  const scope = useSectionScope();
  const query = useHealthAlerts(scope.sectionId);
  return { scope, query, alerts: scope.sectionId ? (query.data ?? []) : [] };
}
