import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { certificateKeys } from "./keys";
import type { Certificate, CertificateAction, CertificateInput } from "./types";

const INVALIDATE = [certificateKeys.all, ["approvals"], ["students"], ["dashboard"]];

const ACTION_TOAST: Record<CertificateAction, string> = {
  approve: "Certificate approved",
  reject: "Request rejected",
  issue: "Issuing the certificate",
  reissue: "Issuing a duplicate",
};

export function useCertificates(params: Query, enabled = true) {
  return useQuery({
    queryKey: certificateKeys.list(params),
    queryFn: () => http.get<Certificate[]>("/certificates", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useRequestCertificate() {
  return useApiMutation({
    mutationFn: async (input: CertificateInput) => (await http.post<Certificate>("/certificates", input)).data,
    invalidate: INVALIDATE,
    success: "Certificate requested",
    toastError: false,
  });
}

/** Issue / reissue answer with a PDF job (`{ jobId }`) or the updated certificate. */
export function useCertificateAction(id: string) {
  return useApiMutation({
    mutationFn: async ({ action, reason }: { action: CertificateAction; reason?: string }) =>
      (await http.post<unknown>(`/certificates/${id}/${action}`, reason ? { reason } : {})).data,
    invalidate: INVALIDATE,
    success: (_, vars) => ACTION_TOAST[vars.action],
    toastError: false,
  });
}
