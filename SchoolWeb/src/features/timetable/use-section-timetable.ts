import { useMemo, useState } from "react";
import { useBranch } from "@/features/branches/api";
import { useSectionOptions } from "@/features/classes/sections-api";
import { hasErrorCode } from "@/lib/api-error";
import { usePeriods, useSectionTimetable } from "./api";
import { dayColumns, periodRows } from "./grid";
import { SCHOOL_DAYS } from "./options";

/** Section picker (defaults to the first section) and the grid frame: working days × periods. */
export function useSectionTimetableTab(branchId: string, sessionId: string | null) {
  const sections = useSectionOptions(branchId, sessionId);
  const [chosen, setSectionId] = useState<string | null>(null);
  const sectionId = sections.options.find((option) => option.id === chosen)?.id ?? sections.options[0]?.id ?? null;
  const section = sections.sections.find((item) => item.id === sectionId) ?? null;

  const timetable = useSectionTimetable(sectionId);
  const branch = useBranch(branchId);
  const bell = usePeriods(branchId);

  const rows = useMemo(() => {
    const own = timetable.data?.periods;
    return periodRows(own?.length ? own : (bell.data ?? []));
  }, [timetable.data, bell.data]);
  const days = useMemo(() => {
    const working = branch.data?.workingDays;
    return dayColumns(working?.length ? working : SCHOOL_DAYS);
  }, [branch.data]);

  return {
    sections,
    sectionId,
    setSectionId,
    section,
    timetable: timetable.data ?? null,
    timetableQuery: timetable,
    rows,
    days,
    loading: sections.isLoading || timetable.isLoading || bell.isLoading || branch.isLoading,
    // A section without any timetable yet may answer 404; that is an empty grid, not an error.
    error: (hasErrorCode(timetable.error, "NOT_FOUND") ? null : timetable.error) ?? bell.error,
    hasSections: sections.options.length > 0,
    hasPeriods: rows.some((row) => !row.isBreak),
  };
}
