import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { useSectionScope } from "@/features/classes/use-section-scope";
import { http } from "@/lib/http";
import { timetableKeys } from "./api";
import { choicesFromSections } from "./section-choices";
import type { Timetable } from "./types";
import { useWorkingDays } from "./use-section-timetable";

/**
 * Teacher: the sections they teach. Their class-teacher section (where the API allows editing)
 * opens first, in edit mode; the others are read-only published timetables.
 */
export function useTeacherSections() {
  const scope = useSectionScope();
  const choices = useMemo(() => choicesFromSections(scope.sections), [scope.sections]);
  const timetables = useQueries({
    queries: choices.map((choice) => ({
      queryKey: timetableKeys.section(choice.id),
      queryFn: async () => (await http.get<Timetable | null>("/timetables", { sectionId: choice.id })).data,
    })),
  });
  const editable = new Set(choices.filter((_, index) => timetables[index]?.data?.canEdit).map((choice) => choice.id));
  const [chosen, setSectionId] = useState<string | null>(null);
  const fallback = choices.find((choice) => editable.has(choice.id)) ?? choices[0] ?? null;
  const section = choices.find((choice) => choice.id === chosen) ?? fallback;
  const workingDays = useWorkingDays(scope.scope.branchId);

  return {
    choices,
    section,
    setSectionId,
    canEdit: !!section && editable.has(section.id),
    workingDays,
    loading: scope.isLoading || timetables.some((query) => query.isLoading),
  };
}
