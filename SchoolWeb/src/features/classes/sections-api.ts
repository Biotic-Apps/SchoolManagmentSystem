import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { Option } from "@/components/shared/OptionSelect";
import { http, type Query } from "@/lib/http";
import { withRowFlash } from "@/lib/row-highlight";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { Section, SectionCreateInput, SectionUpdateInput } from "./types";

export const sectionKeys = {
  all: ["sections"] as const,
  list: (params: Query) => ["sections", "list", params] as const,
};

export function useSections(params: Query, enabled = true) {
  return useQuery({
    queryKey: sectionKeys.list(params),
    queryFn: () => http.get<Section[]>("/sections", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

type SaveSectionVars = { id: string; input: SectionUpdateInput } | { id?: undefined; input: SectionCreateInput };

export function useSaveSection() {
  return useApiMutation({
    mutationFn: withRowFlash(
      ({ id, input }: SaveSectionVars) =>
        id ? http.patch<Section>(`/sections/${id}`, input) : http.post<Section>("/sections", input),
      (result, vars) => vars.id ?? result.data.id,
    ),
    invalidate: [sectionKeys.all, ["dashboard"]],
    success: (_, vars) => (vars.id ? "Section updated" : "Section created"),
    toastError: false,
  });
}

export function useArchiveSection() {
  return useApiMutation({
    mutationFn: (id: string) => http.post(`/sections/${id}/archive`),
    invalidate: [sectionKeys.all, ["dashboard"]],
    success: "Section archived",
  });
}

function sectionLabel(section: Section, withClass: boolean): string {
  const name = withClass ? `${section.className} ${section.name}` : section.name;
  const students = `${section.studentCount} ${section.studentCount === 1 ? "student" : "students"}`;
  // Capacity is optional; without it there is no seat limit to show.
  const seats = section.capacity == null ? students : `${students} of ${section.capacity} seats`;
  return `${name} · ${seats}`;
}

/** Active sections of a branch session for pickers, labelled with seats used / capacity. */
export function useSectionOptions(branchId: string | null, sessionId: string | null, classId?: string | null) {
  const enabled = !!branchId && !!sessionId;
  const query = useSections(
    { page: 1, pageSize: 100, branchId, sessionId, classId: classId ?? undefined, status: "ACTIVE" },
    enabled,
  );
  const sections = query.data?.data ?? [];
  const options: Option[] = sections.map((section) => ({ id: section.id, name: sectionLabel(section, !classId) }));
  const isFull = (id: string) => {
    const section = sections.find((item) => item.id === id);
    return !!section && section.studentCount >= section.capacity;
  };
  return { sections, options, isFull, isLoading: enabled && query.isLoading };
}
