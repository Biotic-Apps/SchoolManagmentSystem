import { useState } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { useSectionOptions } from "./sections-api";
import { useAcademicScope } from "./use-academic-scope";

/**
 * Branch › session › one section, for per-section daily screens (attendance register, diary).
 * Teachers only get their own sections from the API; the first one is picked by default.
 */
export function useSectionScope() {
  const scope = useAcademicScope();
  const sections = useSectionOptions(scope.branchId, scope.sessionId);
  const [chosen, setSectionId] = useState<string | null>(null);

  const options: Option[] = sections.sections.map((section) => ({
    id: section.id,
    name: `${section.className} ${section.name}`,
  }));
  const section = sections.sections.find((item) => item.id === chosen) ?? sections.sections[0] ?? null;

  return {
    scope,
    sectionOptions: options,
    section,
    sectionId: section?.id ?? null,
    setSectionId,
    isLoading: scope.isLoading || sections.isLoading,
    error: scope.error,
  };
}

export type SectionScope = ReturnType<typeof useSectionScope>;
