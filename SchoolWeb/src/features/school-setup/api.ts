import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { branchKeys } from "@/features/branches/api";
import { schoolKeys } from "@/features/schools/api";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { SchoolSetupInput, SchoolSetupResult, SetupChecklist } from "./types";

export const setupKeys = {
  checklist: (branchId: string | null) => ["setup", "checklist", branchId ?? "own"] as const,
};

export function useSetupSchool() {
  return useApiMutation({
    mutationFn: async (input: SchoolSetupInput) => (await http.post<SchoolSetupResult>("/schools/setup", input)).data,
    invalidate: [schoolKeys.all, branchKeys.all],
    toastError: false,
  });
}

/** Principals may omit the branch (their own); super admins must pass one. */
export function useSetupChecklist(branchId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: setupKeys.checklist(branchId),
    queryFn: async () => (await http.get<SetupChecklist>("/setup/checklist", { branchId })).data,
    enabled,
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 60_000,
  });
}
