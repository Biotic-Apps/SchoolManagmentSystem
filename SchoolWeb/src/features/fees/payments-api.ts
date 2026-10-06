import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { feesKeys } from "./keys";
import type { Invoice, Payment, PaymentMethod } from "./types";

export interface PaymentInput {
  studentId: string;
  amountMinor: number;
  method: PaymentMethod;
  reference?: string;
  receivedOn: string;
  allocations?: { invoiceId: string; amountMinor: number }[];
  clientRequestId: string;
}

export interface RefundInput {
  paymentId: string;
  amountMinor: number;
  reason: string;
  method: string;
}

const INVALIDATE = [feesKeys.all, ["dashboard"]];
const INVALIDATE_APPROVAL = [feesKeys.all, ["approvals"]];

export function usePayments(params: Query, enabled = true) {
  return useQuery({
    queryKey: feesKeys.payments(params),
    queryFn: () => http.get<Payment[]>("/payments", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** Invoices of one student that still carry a balance, for allocating a payment. */
export function useOpenInvoices(studentId: string | null) {
  return useQuery({
    queryKey: ["fees", "invoices", "open", studentId],
    queryFn: async () => (await http.get<Invoice[]>("/invoices", { studentId, page: 1, pageSize: 100 })).data ?? [],
    enabled: !!studentId,
    select: (invoices) =>
      invoices.filter(
        (invoice) => invoice.balanceMinor > 0 && invoice.status !== "DRAFT" && invoice.status !== "CANCELLED",
      ),
  });
}

export function useRecordPayment() {
  return useApiMutation({
    mutationFn: async (input: PaymentInput) => (await http.post<Payment>("/payments", input)).data,
    invalidate: INVALIDATE,
    success: (payment) => (payment?.receiptNo ? `Payment recorded · ${payment.receiptNo}` : "Payment recorded"),
    toastError: false,
  });
}

export function useReversePayment() {
  return useApiMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => http.post(`/payments/${id}/reverse`, { reason }),
    invalidate: INVALIDATE_APPROVAL,
    success: "Reversal sent for approval",
    toastError: false,
  });
}

export function useRequestRefund() {
  return useApiMutation({
    mutationFn: (input: RefundInput) => http.post("/refunds", input),
    invalidate: INVALIDATE_APPROVAL,
    success: "Sent for approval",
    toastError: false,
  });
}
