import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { Option } from "@/components/shared/OptionSelect";
import { OPTIONS_PAGE } from "@/config/options";
import { http, type Query } from "@/lib/http";
import { withRowFlash } from "@/lib/row-highlight";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { AssignmentInput, CreatedUser, CreateUserInput, UpdateUserInput, UserDetail, UserSummary } from "./types";

export const userKeys = {
  all: ["users"] as const,
  list: (params: Query) => ["users", "list", params] as const,
  detail: (id: string) => ["users", "detail", id] as const,
};

export function useUsers(params: Query, enabled = true) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => http.get<UserSummary[]>("/users", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useUser(id: string | null) {
  return useQuery({
    queryKey: userKeys.detail(id ?? ""),
    queryFn: async () => (await http.get<UserDetail>(`/users/${id}`)).data,
    enabled: !!id,
  });
}

/** Active users holding a role, for pickers (e.g. choosing a branch principal). */
export function useUserOptions(role: string, enabled = true) {
  const query = useUsers({ ...OPTIONS_PAGE, role, status: "ACTIVE" }, enabled);
  const options: Option[] = (query.data?.data ?? []).map((user) => ({
    id: user.id,
    name: user.email ? `${user.name} (${user.email})` : user.name,
  }));
  return { options, isLoading: query.isLoading };
}

export function useCreateUser() {
  return useApiMutation({
    mutationFn: withRowFlash(
      async (input: CreateUserInput) => (await http.post<CreatedUser>("/users", input)).data,
      (user) => user.id,
    ),
    invalidate: [userKeys.all],
    success: "User created",
    toastError: false,
  });
}

export function useUpdateUser(id: string) {
  return useApiMutation({
    mutationFn: withRowFlash((input: UpdateUserInput) => http.patch<UserDetail>(`/users/${id}`, input), () => id),
    invalidate: [userKeys.all],
    success: "User updated",
    toastError: false,
  });
}

export function useUserStatus() {
  return useApiMutation({
    mutationFn: ({ id, action }: { id: string; action: "disable" | "enable" }) => http.post(`/users/${id}/${action}`),
    invalidate: [userKeys.all],
    success: (_, vars) => (vars.action === "disable" ? "User disabled and signed out" : "User enabled"),
  });
}

export function useUnlockUser() {
  return useApiMutation({
    mutationFn: (id: string) => http.post(`/users/${id}/unlock`),
    invalidate: [userKeys.all],
    success: "Account unlocked. The user can sign in again.",
  });
}

export function useResetPassword() {
  return useApiMutation({
    mutationFn: async (id: string) =>
      (await http.post<{ temporaryPassword: string }>(`/users/${id}/reset-password`)).data.temporaryPassword,
    invalidate: [userKeys.all],
  });
}

export function useAddAssignment(userId: string) {
  return useApiMutation({
    mutationFn: (input: AssignmentInput) => http.post(`/users/${userId}/assignments`, input),
    invalidate: [userKeys.all],
    success: "Role assigned",
    toastError: false,
  });
}

export function useEndAssignment(userId: string) {
  return useApiMutation({
    mutationFn: (assignmentId: string) => http.delete(`/users/${userId}/assignments/${assignmentId}`),
    invalidate: [userKeys.all],
    success: "Assignment ended",
  });
}
