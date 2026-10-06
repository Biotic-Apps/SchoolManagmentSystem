import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { feesKeys } from "./keys";
import type { Invoice } from "./types";

export interface GenerateInvoicesInput {
  branchId: string;
  sessionId: string;
  period: string;
  classIds?: string[];
}

export interface AdHocInvoiceInput {
  studentId: string;
  dueDate: string;
  lines: { feeHeadId: string; description: string; amountMinor: number }[];
}

/** Challan PDF: a ready file url, or a background job to wait for. */
export interface InvoicePdfResult {
  fileUrl?: string | null;
  url?: string | null;
  jobId?: string | null;
}

export function useInvoices(params: Query, enabled = true) {
  return useQuery({
    queryKey: feesKeys.invoices(params),
    queryFn: () => http.get<Invoice[]>("/invoices", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useInvoice(id: string | null) {
  return useQuery({
    queryKey: feesKeys.invoice(id),
    queryFn: async () => (await http.get<Invoice>(`/invoices/${id}`)).data,
    enabled: !!id,
  });
}

export function useGenerateInvoices() {
  return useApiMutation({
    mutationFn: async (input: GenerateInvoicesInput) =>
      (await http.post<{ jobId?: string | null }>("/invoices/generate", input)).data,
    invalidate: [feesKeys.all],
    toastError: false,
  });
}

export function useIssueInvoices() {
  return useApiMutation({
    mutationFn: (invoiceIds: string[]) => http.post("/invoices/issue", { invoiceIds }),
    invalidate: [feesKeys.all],
    success: (_, ids) => (ids.length === 1 ? "Invoice issued" : `${ids.length} invoices issued`),
  });
}

export function useCreateInvoice() {
  return useApiMutation({
    mutationFn: async (input: AdHocInvoiceInput) => (await http.post<Invoice>("/invoices", input)).data,
    invalidate: [feesKeys.all],
    success: "Draft invoice created",
    toastError: false,
  });
}

export function useCancelInvoice() {
  return useApiMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => http.post(`/invoices/${id}/cancel`, { reason }),
    invalidate: [feesKeys.all, ["approvals"]],
    toastError: false,
  });
}

export function useInvoicePdf() {
  return useApiMutation({
    mutationFn: async (id: string) => (await http.get<InvoicePdfResult>(`/invoices/${id}/pdf`)).data,
  });
}
