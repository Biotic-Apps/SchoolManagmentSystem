import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { DocumentInput, DocumentOwnerType, SchoolDocument } from "./types";

export const documentKeys = {
  all: ["documents"] as const,
  owner: (ownerType: DocumentOwnerType, ownerId: string) => ["documents", ownerType, ownerId] as const,
};

export function useDocuments(ownerType: DocumentOwnerType, ownerId: string | null) {
  return useQuery({
    queryKey: documentKeys.owner(ownerType, ownerId ?? ""),
    queryFn: async () => (await http.get<SchoolDocument[]>("/documents", { ownerType, ownerId, pageSize: 100 })).data,
    enabled: !!ownerId,
  });
}

// Applications have their own upload endpoint (it also moves the application along).
function addDocument(ownerType: DocumentOwnerType, ownerId: string, input: DocumentInput) {
  if (ownerType === "APPLICATION") return http.post<SchoolDocument>(`/admissions/applications/${ownerId}/documents`, input);
  return http.post<SchoolDocument>("/documents", { ownerType, ownerId, ...input });
}

export function useAddDocument(ownerType: DocumentOwnerType, ownerId: string) {
  return useApiMutation({
    mutationFn: (input: DocumentInput) => addDocument(ownerType, ownerId, input),
    invalidate: [documentKeys.all, ["students"], ["staff"], ["admissions"]],
    success: "Document uploaded",
    toastError: false,
  });
}

/** Uploads several staged documents after the owner record exists (e.g. a new application). */
export async function addDocuments(ownerType: DocumentOwnerType, ownerId: string, inputs: DocumentInput[]) {
  for (const input of inputs) await addDocument(ownerType, ownerId, input);
}

export function useVerifyDocument() {
  return useApiMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      http.post<SchoolDocument>(`/documents/${id}/verify`, note ? { note } : {}),
    invalidate: [documentKeys.all, ["students"], ["staff"], ["admissions"]],
    success: "Document verified",
  });
}

export function useRejectDocument() {
  return useApiMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      http.post<SchoolDocument>(`/documents/${id}/reject`, { reason }),
    invalidate: [documentKeys.all, ["students"], ["staff"], ["admissions"]],
    success: "Document rejected",
    toastError: false,
  });
}
