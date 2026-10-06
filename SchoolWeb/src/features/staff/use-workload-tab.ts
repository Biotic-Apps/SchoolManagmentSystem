import { useStaffWorkload } from "./api";
import type { WorkloadItem } from "./types";
import { useStaffSession } from "./use-staff-session";

export interface WorkloadMetric {
  count: number | null;
  names: string[];
}

function itemName(item: WorkloadItem): string {
  const section = [item.className, item.sectionName].filter(Boolean).join(" ");
  const label = item.name ?? [section, item.subjectName].filter(Boolean).join(" · ");
  return item.periods != null && label ? `${label} (${item.periods} periods)` : label;
}

// The contract leaves sections/subjects as either a count or a list.
function toMetric(value: number | WorkloadItem[] | undefined): WorkloadMetric {
  if (typeof value === "number") return { count: value, names: [] };
  if (!Array.isArray(value)) return { count: null, names: [] };
  return { count: value.length, names: value.map(itemName).filter(Boolean) };
}

export function useWorkloadTab(staffId: string, branchId: string | null) {
  const session = useStaffSession(branchId);
  const query = useStaffWorkload(staffId, session.sessionId);
  const data = query.data;

  return {
    session,
    query,
    loading: session.isLoading || query.isLoading,
    hasSessions: session.options.length > 0,
    periodsPerWeek: data?.periodsPerWeek ?? null,
    sections: toMetric(data?.sections),
    subjects: toMetric(data?.subjects),
  };
}
