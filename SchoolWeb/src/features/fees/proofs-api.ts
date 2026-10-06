import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { feesKeys } from "./keys";
import type { PaymentProof, ProofMethod } from "./types";

export interface ProofInput {
  invoiceId: string;
  amountMinor: number;
  paidOn: string;
  method: ProofMethod;
  reference: string;
  fileId: string;
}

const INVALIDATE = [feesKeys.all, ["dashboard"]];

export function useProofs(params: Query, enabled = true) {
  return useQuery({
    queryKey: feesKeys.proofs(params),
    queryFn: () => http.get<PaymentProof[]>("/payment-proofs", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useVerifyProof() {
  return useApiMutation({
    mutationFn: ({ id, receivedOn, note }: { id: string; receivedOn?: string; note?: string }) =>
      http.post(`/payment-proofs/${id}/verify`, { receivedOn, note }),
    invalidate: INVALIDATE,
    success: "Proof verified and payment recorded",
    toastError: false,
  });
}

export function useRejectProof() {
  return useApiMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      http.post(`/payment-proofs/${id}/reject`, { reason }),
    invalidate: INVALIDATE,
    success: "Proof rejected",
    toastError: false,
  });
}

export function useSubmitProof() {
  return useApiMutation({
    mutationFn: (input: ProofInput) => http.post<PaymentProof>("/payment-proofs", input),
    invalidate: [feesKeys.all],
    success: "Proof submitted. The school will verify it.",
    toastError: false,
  });
}
