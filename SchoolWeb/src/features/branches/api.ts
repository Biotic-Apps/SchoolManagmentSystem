import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { OPTIONS_PAGE } from "@/config/options";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { useCan } from "@/features/auth/use-can";
import { useAssignedBranches } from "./use-assigned-branches";
import type { StatusAction } from "@/features/schools/types";
import type { Branch, BranchInput, BranchSettings } from "./types";

export const branchKeys = {
  all: ["branches"] as const,
  list: (params: Query) => ["branches", "list", params] as const,
  detail: (id: string) => ["branches", "detail", id] as const,
  settings: (id: string) => ["branches", "settings", id] as const,
};

export function useBranches(params: Query, enabled = true) {
  return useQuery({
    queryKey: branchKeys.list(params),
    queryFn: () => http.get<Branch[]>("/branches", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** Active branches in the caller's scope, for pickers. */
export function useActiveBranches(schoolId?: string, enabled = true) {
  // Roles without branches.view (teachers, helpers, coordinators…) take their branches from /me instead.
  const canList = useCan()("branches.view");
  const assigned = useAssignedBranches(schoolId);
  const query = useBranches({ ...OPTIONS_PAGE, status: "ACTIVE", schoolId }, enabled && canList);
  if (!canList) return { branches: assigned, isLoading: false, error: null };
  return { branches: query.data?.data ?? [], isLoading: query.isLoading, error: query.error };
}

/** Branch detail; roles without branches.view skip it (callers fall back to defaults). */
export function useBranch(id: string | null) {
  const canView = useCan()("branches.view");
  return useQuery({
    queryKey: branchKeys.detail(id ?? ""),
    queryFn: async () => (await http.get<Branch>(`/branches/${id}`)).data,
    enabled: !!id && canView,
  });
}

export function useSaveBranch() {
  return useApiMutation({
    mutationFn: ({ id, input }: { id?: string; input: BranchInput }) =>
      id ? http.patch<Branch>(`/branches/${id}`, input) : http.post<Branch>("/branches", input),
    invalidate: [branchKeys.all],
    success: (_, vars) => (vars.id ? "Branch updated" : "Branch created"),
    toastError: false,
  });
}

export function useBranchStatus() {
  return useApiMutation({
    mutationFn: ({ id, action }: { id: string; action: StatusAction }) => http.post(`/branches/${id}/${action}`),
    invalidate: [branchKeys.all],
    success: (_, vars) => (vars.action === "archive" ? "Branch archived" : "Branch activated"),
  });
}

export function useChangePrincipal() {
  return useApiMutation({
    mutationFn: ({ branchId, userId }: { branchId: string; userId: string }) =>
      http.put(`/branches/${branchId}/principal`, { userId }),
    invalidate: [branchKeys.all, ["users"]],
    success: "Principal changed",
    toastError: false,
  });
}

export function useBranchSettings(id: string | null) {
  return useQuery({
    queryKey: branchKeys.settings(id ?? ""),
    queryFn: async () => (await http.get<BranchSettings>(`/branches/${id}/settings`)).data,
    enabled: !!id,
  });
}

export function useSaveBranchSettings(id: string) {
  return useApiMutation({
    mutationFn: (patch: BranchSettings) => http.patch<BranchSettings>(`/branches/${id}/settings`, patch),
    invalidate: [branchKeys.settings(id)],
    success: "Branch settings saved",
    toastError: false,
  });
}
