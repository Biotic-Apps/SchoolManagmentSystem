import { useQuery } from "@tanstack/react-query";
import { hasErrorCode } from "@/lib/api-error";
import { http } from "@/lib/http";
import { feesKeys } from "./keys";
import type { Invoice, PaymentProof } from "./types";

/** Invoices of the active child (the API scopes parents to their own children). */
export function useChildInvoices(studentId: string | null) {
  return useQuery({
    queryKey: ["fees", "invoices", "child", studentId],
    queryFn: async () => (await http.get<Invoice[]>("/invoices", { studentId, page: 1, pageSize: 100 })).data ?? [],
    enabled: !!studentId,
  });
}

export function useChildInvoice(id: string | null) {
  return useQuery({
    queryKey: feesKeys.invoice(id),
    queryFn: async () => (await http.get<Invoice>(`/invoices/${id}`)).data,
    enabled: !!id,
  });
}

/** Proofs submitted for the child; null when the API does not open this list to parents. */
export function useChildProofs(studentId: string | null) {
  return useQuery({
    queryKey: ["fees", "proofs", "child", studentId],
    queryFn: async () => {
      try {
        return (await http.get<PaymentProof[]>("/payment-proofs", { studentId, page: 1, pageSize: 50 })).data ?? [];
      } catch (error) {
        if (hasErrorCode(error, "FORBIDDEN") || hasErrorCode(error, "FORBIDDEN_SCOPE")) return null;
        throw error;
      }
    },
    enabled: !!studentId,
    retry: false,
  });
}
