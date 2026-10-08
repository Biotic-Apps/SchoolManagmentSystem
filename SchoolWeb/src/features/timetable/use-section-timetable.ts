import { useMemo, useState } from "react";
import { useBranch } from "@/features/branches/api";
import { useClassesOverview } from "@/features/classes/overview-api";
import { useBellScheduleQuery } from "./bell-api";
import { choicesFromOverview } from "./section-choices";

const DEFAULT_DAYS = [1, 2, 3, 4, 5, 6];

/** Branch working days: from the bell schedule, else the branch, else Mon–Sat. */
export function useWorkingDays(branchId: string | null): number[] {
  const bell = useBellScheduleQuery(branchId);
  const branch = useBranch(branchId);
  return useMemo(() => {
    const days = bell.data?.workingDays?.length ? bell.data.workingDays : branch.data?.workingDays;
    return days?.length ? [...days].sort((a, b) => a - b) : DEFAULT_DAYS;
  }, [bell.data, branch.data]);
}

/** Section picker grouped by class (defaults to the linked section, else the first one). */
export function useSectionTimetableTab(branchId: string, sessionId: string | null, initialSectionId: string | null) {
  const overview = useClassesOverview(branchId, sessionId);
  const choices = useMemo(() => choicesFromOverview(overview.data ?? []), [overview.data]);
  const [chosen, setSectionId] = useState<string | null>(initialSectionId);
  const section = choices.find((choice) => choice.id === chosen) ?? choices[0] ?? null;
  const workingDays = useWorkingDays(branchId);

  return {
    choices,
    section,
    setSectionId,
    workingDays,
    loading: overview.isLoading,
    error: overview.error,
    retry: () => overview.refetch(),
  };
}
