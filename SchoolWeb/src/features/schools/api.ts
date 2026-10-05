import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { Option } from "@/components/shared/OptionSelect";
import { OPTIONS_PAGE } from "@/config/options";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { School, SchoolInput, StatusAction } from "./types";

export const schoolKeys = {
  all: ["schools"] as const,
  list: (params: Query) => ["schools", "list", params] as const,
  detail: (id: string) => ["schools", "detail", id] as const,
};

export function useSchools(params: Query, enabled = true) {
  return useQuery({
    queryKey: schoolKeys.list(params),
    queryFn: () => http.get<School[]>("/schools", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useSchool(id: string | null) {
  return useQuery({
    queryKey: schoolKeys.detail(id ?? ""),
    queryFn: async () => (await http.get<School>(`/schools/${id}`)).data,
    enabled: !!id,
  });
}

export function useSchoolOptions(enabled = true) {
  const query = useSchools({ ...OPTIONS_PAGE, status: "ACTIVE" }, enabled);
  const options: Option[] = (query.data?.data ?? []).map((school) => ({ id: school.id, name: school.name }));
  return { options, isLoading: query.isLoading };
}

export function saveSchool({ id, input }: { id?: string; input: SchoolInput }) {
  return id ? http.patch<School>(`/schools/${id}`, input) : http.post<School>("/schools", input);
}

export function useSaveSchool() {
  return useApiMutation({
    mutationFn: saveSchool,
    invalidate: [schoolKeys.all],
    success: (_, vars) => (vars.id ? "School updated" : "School created"),
    toastError: false,
  });
}

export function useSchoolStatus() {
  return useApiMutation({
    mutationFn: ({ id, action }: { id: string; action: StatusAction }) => http.post(`/schools/${id}/${action}`),
    invalidate: [schoolKeys.all],
    success: (_, vars) => (vars.action === "archive" ? "School archived" : "School activated"),
  });
}
