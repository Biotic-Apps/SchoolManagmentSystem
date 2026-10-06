import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { inventoryKeys } from "./keys";
import type { PurchaseOrderInput, PurchaseRequest, PurchaseRequestInput, ReceiveInput } from "./types";

const INVALIDATE = [inventoryKeys.all, ["approvals"]];

export function usePurchaseRequests(params: Query, enabled = true) {
  return useQuery({
    queryKey: inventoryKeys.purchaseRequests(params),
    queryFn: () => http.get<PurchaseRequest[]>("/purchase-requests", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useCreatePurchaseRequest() {
  return useApiMutation({
    mutationFn: async (input: PurchaseRequestInput) =>
      (await http.post<PurchaseRequest>("/purchase-requests", input)).data,
    invalidate: INVALIDATE,
    success: "Purchase request sent for approval",
    toastError: false,
  });
}

export function useCreatePurchaseOrder(requestId: string) {
  return useApiMutation({
    mutationFn: (input: PurchaseOrderInput) => http.post<unknown>(`/purchase-requests/${requestId}/order`, input),
    invalidate: INVALIDATE,
    success: "Purchase order created",
    toastError: false,
  });
}

export function useReceiveOrder(orderId: string) {
  return useApiMutation({
    mutationFn: (input: ReceiveInput) => http.post<unknown>(`/purchase-orders/${orderId}/receive`, input),
    invalidate: [inventoryKeys.all],
    success: "Items received into stock",
    toastError: false,
  });
}

export function useBillOrder(orderId: string) {
  return useApiMutation({
    mutationFn: () => http.post<unknown>(`/purchase-orders/${orderId}/bill`),
    invalidate: [inventoryKeys.all, ["expenses"]],
    success: "Vendor bill created. Find it under Expenses & Vendors to submit and pay it.",
  });
}
