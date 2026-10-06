import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-error";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { inventoryKeys } from "./keys";
import type { MovementInput, StockMovement, StockRow } from "./types";

export function useStock(branchId: string | null) {
  return useQuery({
    queryKey: inventoryKeys.stock(branchId),
    queryFn: async () => (await http.get<StockRow[]>("/inventory/stock", { branchId })).data,
    enabled: !!branchId,
  });
}

/**
 * Recent movements. Not in the phase 4 contract, so a missing endpoint (404) just
 * hides the list instead of showing an error.
 */
export function useMovements(branchId: string | null) {
  return useQuery({
    queryKey: inventoryKeys.movements(branchId),
    queryFn: async () => {
      try {
        return (await http.get<StockMovement[]>("/inventory/movements", { branchId, page: 1, pageSize: 20 })).data;
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
    enabled: !!branchId,
    retry: false,
  });
}

export function useRecordMovement() {
  return useApiMutation({
    mutationFn: (input: MovementInput) => http.post<unknown>("/inventory/movements", input),
    invalidate: [inventoryKeys.all],
    success: "Movement recorded",
    toastError: false,
  });
}
