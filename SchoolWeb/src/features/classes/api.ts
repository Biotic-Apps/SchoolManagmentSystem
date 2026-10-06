import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { Option } from "@/components/shared/OptionSelect";
import { OPTIONS_PAGE } from "@/config/options";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { SchoolClass, SchoolClassInput, Subject } from "./types";

export const classKeys = {
  all: ["classes"] as const,
  list: (params: Query) => ["classes", "list", params] as const,
  subjects: (classId: string) => ["classes", "subjects", classId] as const,
};

export function useClasses(params: Query, enabled = true) {
  return useQuery({
    queryKey: classKeys.list(params),
    queryFn: () => http.get<SchoolClass[]>("/classes", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useClassOptions(schoolId: string | null) {
  const query = useClasses({ ...OPTIONS_PAGE, schoolId }, !!schoolId);
  const options: Option[] = (query.data?.data ?? []).map((item) => ({ id: item.id, name: item.name }));
  return { options, isLoading: query.isLoading };
}

export function useSaveClass() {
  return useApiMutation({
    mutationFn: ({ id, input }: { id?: string; input: SchoolClassInput }) =>
      id ? http.patch<SchoolClass>(`/classes/${id}`, input) : http.post<SchoolClass>("/classes", input),
    invalidate: [classKeys.all],
    success: (_, vars) => (vars.id ? "Class updated" : "Class created"),
    toastError: false,
  });
}

export function useClassSubjects(classId: string, enabled = true) {
  return useQuery({
    queryKey: classKeys.subjects(classId),
    queryFn: async () => (await http.get<Subject[]>(`/classes/${classId}/subjects`)).data,
    enabled: enabled && !!classId,
  });
}

export function useSaveClassSubjects(classId: string) {
  return useApiMutation({
    mutationFn: (subjectIds: string[]) => http.put<Subject[]>(`/classes/${classId}/subjects`, { subjectIds }),
    invalidate: [classKeys.all],
    success: "Class subjects saved",
  });
}

/** Subject options for a class; idle until a class is chosen. */
export function useClassSubjectOptions(classId: string | null | undefined) {
  const query = useClassSubjects(classId ?? "", !!classId);
  const options: Option[] = (query.data ?? []).map((subject) => ({ id: subject.id, name: subject.name }));
  return { options, isLoading: !!classId && query.isLoading };
}
