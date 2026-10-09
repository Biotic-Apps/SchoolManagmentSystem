import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { withRowFlash } from "@/lib/row-highlight";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { Permission, Role, RoleInput } from "./types";

export const roleKeys = {
  all: ["roles"] as const,
  list: ["roles", "list"] as const,
  permissions: ["permissions"] as const,
};

export function usePermissionCatalogue() {
  return useQuery({
    queryKey: roleKeys.permissions,
    queryFn: async () => (await http.get<Permission[]>("/permissions")).data,
    staleTime: Infinity,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: roleKeys.list,
    queryFn: async () => (await http.get<Role[]>("/roles")).data,
  });
}

export function useSaveRole() {
  return useApiMutation({
    mutationFn: withRowFlash(
      ({ id, input }: { id?: string; input: RoleInput }) =>
        id ? http.patch<Role>(`/roles/${id}`, input) : http.post<Role>("/roles", input),
      (result, vars) => vars.id ?? result.data.id,
    ),
    invalidate: [roleKeys.all],
    success: (_, vars) => (vars.id ? "Role updated" : "Role created"),
    toastError: false,
  });
}

export function useDeleteRole() {
  return useApiMutation({
    mutationFn: (id: string) => http.delete(`/roles/${id}`),
    invalidate: [roleKeys.all],
    success: "Role deleted",
  });
}
