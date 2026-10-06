import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import type { HealthAlert } from "./types";

/** Allergy / medical instruction alerts for a section roster (attendance, roster screens). */
export function useHealthAlerts(sectionId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["health", "alerts", sectionId],
    queryFn: async () => (await http.get<HealthAlert[]>("/health/alerts", { sectionId })).data,
    enabled: enabled && !!sectionId,
    staleTime: 5 * 60_000,
  });
}
