import { useActiveBranches } from "@/features/branches/api";
import { useClassOptions } from "@/features/classes/api";
import { useSectionOptions } from "@/features/classes/sections-api";

export interface AudienceContext {
  schoolId: string | null;
  branchId: string | null;
  sessionId: string | null;
}

/** Branches, classes and the current branch-session's sections to address a notice or activity to. */
export function useAudienceOptions({ schoolId, branchId, sessionId }: AudienceContext) {
  const branches = useActiveBranches(schoolId ?? undefined, !!schoolId);
  const classes = useClassOptions(schoolId);
  const sections = useSectionOptions(branchId, sessionId);

  const branchOptions = branches.branches.map((branch) => ({ id: branch.id, name: branch.name }));
  const sectionOptions = sections.sections.map((section) => ({
    id: section.id,
    name: `${section.className} ${section.name}`,
  }));
  const names = new Map([...branchOptions, ...classes.options, ...sectionOptions].map((item) => [item.id, item.name]));

  return {
    branchOptions,
    classOptions: classes.options,
    sectionOptions,
    loading: branches.isLoading || classes.isLoading || sections.isLoading,
    nameOf: (id: string) => names.get(id),
  };
}

export type AudienceOptions = ReturnType<typeof useAudienceOptions>;
