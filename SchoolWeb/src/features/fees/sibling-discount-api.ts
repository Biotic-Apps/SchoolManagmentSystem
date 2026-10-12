import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { withRowFlash } from "@/lib/row-highlight";
import { useApiMutation } from "@/lib/use-api-mutation";
import { feesKeys } from "./keys";

export interface SiblingDiscount {
  id: string;
  schoolId: string;
  childIndex: number;
  percentOff: number;
  createdAt: string;
}

export interface SiblingDiscountInput {
  childIndex: number;
  percentOff: number;
}

export function useSiblingDiscounts(schoolId: string | null) {
  return useQuery({
    queryKey: feesKeys.siblingDiscounts(schoolId),
    queryFn: async () =>
      (await http.get<SiblingDiscount[]>("/sibling-discounts", { schoolId })).data,
    enabled: !!schoolId,
  });
}

export function useCreateSiblingDiscount() {
  return useApiMutation({
    mutationFn: withRowFlash(
      async (input: SiblingDiscountInput) =>
        (await http.post<SiblingDiscount>("/sibling-discounts", input)).data,
      (row) => row.id,
    ),
    invalidate: [feesKeys.all],
    success: "Sibling discount rule added",
    toastError: false,
  });
}

export function useUpdateSiblingDiscount() {
  return useApiMutation({
    mutationFn: async ({ id, percentOff }: { id: string; percentOff: number }) =>
      (await http.patch<SiblingDiscount>(`/sibling-discounts/${id}`, { percentOff })).data,
    invalidate: [feesKeys.all],
    success: "Sibling discount updated",
    toastError: false,
  });
}

export function useDeleteSiblingDiscount() {
  return useApiMutation({
    mutationFn: (id: string) => http.delete(`/sibling-discounts/${id}`),
    invalidate: [feesKeys.all],
    success: "Sibling discount removed",
  });
}
