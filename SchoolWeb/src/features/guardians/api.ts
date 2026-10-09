import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { GuardianInput } from "@/features/people/types";
import type { AddedGuardianLink, Guardian, GuardianDetail, LinkGuardianInput } from "./types";

export const guardianKeys = {
  all: ["guardians"] as const,
  list: (params: Query) => ["guardians", "list", params] as const,
  detail: (id: string) => ["guardians", "detail", id] as const,
};

const INVALIDATE = [guardianKeys.all, ["students"], ["child-links"]];

export function useGuardians(params: Query, enabled = true) {
  return useQuery({
    queryKey: guardianKeys.list(params),
    queryFn: () => http.get<Guardian[]>("/guardians", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useGuardian(id: string | null) {
  return useQuery({
    queryKey: guardianKeys.detail(id ?? ""),
    queryFn: async () => (await http.get<GuardianDetail>(`/guardians/${id}`)).data,
    enabled: !!id,
  });
}

export function useUpdateGuardian(id: string) {
  return useApiMutation({
    mutationFn: (input: Partial<GuardianInput>) => http.patch<Guardian>(`/guardians/${id}`, input),
    invalidate: INVALIDATE,
    success: "Guardian updated",
    toastError: false,
  });
}

export function useCreateParentAccount() {
  return useApiMutation({
    mutationFn: async (guardianId: string) =>
      (
        await http.post<{ userId: string; email: string | null; phone: string | null; temporaryPassword: string | null }>(
          `/guardians/${guardianId}/account`,
        )
      ).data,
    invalidate: INVALIDATE,
    success: "Parent account created",
  });
}

export function useResetParentPassword() {
  return useApiMutation({
    mutationFn: async (guardianId: string) =>
      (
        await http.post<{ userId: string; temporaryPassword: string }>(
          `/guardians/${guardianId}/account/reset-password`,
        )
      ).data,
    invalidate: INVALIDATE,
    success: "New temporary password created",
  });
}

export function useSendParentSignIn() {
  return useApiMutation({
    mutationFn: async (guardianId: string) =>
      (await http.post<{ channels: ("EMAIL" | "SMS")[] }>(`/guardians/${guardianId}/account/send-sign-in`)).data,
  });
}

export function useLinkGuardian(studentId: string) {
  return useApiMutation({
    mutationFn: async (input: LinkGuardianInput) =>
      (await http.post<AddedGuardianLink>(`/students/${studentId}/guardians`, input)).data,
    invalidate: INVALIDATE,
    success: "Guardian linked",
    toastError: false,
  });
}

export function useUnlinkGuardian() {
  return useApiMutation({
    mutationFn: ({ studentId, linkId, reason }: { studentId: string; linkId: string; reason: string }) =>
      http.delete(`/students/${studentId}/guardians/${linkId}`, { reason }),
    invalidate: INVALIDATE,
    success: "Link removed",
    toastError: false,
  });
}

/** Link a child picked at submit time (guardian drawer); same endpoint as useLinkGuardian. */
export function useLinkChild() {
  return useApiMutation({
    mutationFn: ({ studentId, input }: { studentId: string; input: LinkGuardianInput }) =>
      http.post(`/students/${studentId}/guardians`, input),
    invalidate: INVALIDATE,
    success: "Child linked",
    toastError: false,
  });
}
