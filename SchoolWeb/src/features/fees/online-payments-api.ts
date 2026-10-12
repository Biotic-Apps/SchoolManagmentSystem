import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { feesKeys } from "./keys";

export interface OnlinePaymentResult {
  gateway: string;
  redirectUrl: string;
  formData?: Record<string, string>;
  onlinePaymentId?: string;
}

export interface OnlinePaymentStatus {
  id: string;
  gateway: string;
  status: "INITIATED" | "SUCCESS" | "FAILED" | "EXPIRED";
  amountMinor: number;
  currency: string;
  gatewayRef?: string | null;
  paymentId?: string | null;
  createdAt: string;
}

/** Initiate an online payment for an invoice. */
export function useInitiateOnlinePayment() {
  return useApiMutation({
    mutationFn: async (invoiceId: string) =>
      (await http.post<OnlinePaymentResult>("/payments/online/initiate", { invoiceId })).data,
    invalidate: [feesKeys.all],
    toastError: true,
  });
}

/** Check status of an online payment attempt. */
export function useOnlinePaymentStatus(id: string | null) {
  return useQuery({
    queryKey: ["fees", "online-payment", id],
    queryFn: async () => (await http.get<OnlinePaymentStatus>(`/payments/online/${id}/status`)).data,
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Keep polling while initiated
      return status === "INITIATED" ? 5000 : false;
    },
  });
}

/** List online payment attempts for an invoice. */
export function useOnlinePaymentsForInvoice(invoiceId: string | null) {
  return useQuery({
    queryKey: ["fees", "online-payments", invoiceId],
    queryFn: async () =>
      (await http.get<OnlinePaymentStatus[]>(`/payments/online/invoice/${invoiceId}`)).data ?? [],
    enabled: !!invoiceId,
  });
}
