import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { withRowFlash } from "@/lib/row-highlight";
import { useApiMutation } from "@/lib/use-api-mutation";
import { classKeys } from "./api";
import type { Subject, SubjectInput } from "./types";

export const subjectKeys = {
  all: ["subjects"] as const,
  list: (params: Query) => ["subjects", "list", params] as const,
};

export function useSubjects(params: Query, enabled = true) {
  return useQuery({
    queryKey: subjectKeys.list(params),
    queryFn: () => http.get<Subject[]>("/subjects", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useSaveSubject() {
  return useApiMutation({
    mutationFn: withRowFlash(
      ({ id, input }: { id?: string; input: SubjectInput }) =>
        id ? http.patch<Subject>(`/subjects/${id}`, input) : http.post<Subject>("/subjects", input),
      (result, vars) => vars.id ?? result.data.id,
    ),
    invalidate: [subjectKeys.all, classKeys.all],
    success: (_, vars) => (vars.id ? "Subject updated" : "Subject created"),
    toastError: false,
  });
}
