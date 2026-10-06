import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { inventoryKeys } from "./keys";
import type { SaleInput } from "./types";

export function useRecordSale() {
  return useApiMutation({
    mutationFn: (input: SaleInput) => http.post<unknown>("/inventory/sales", input),
    invalidate: [inventoryKeys.all, ["fees"]],
    success: "Sale recorded and added to the student's invoice",
    toastError: false,
  });
}
