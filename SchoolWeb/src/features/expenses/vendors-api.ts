import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { expenseKeys } from "./keys";
import type { Vendor, VendorInput } from "./types";

export function useVendors(params: Query = {}, enabled = true) {
  return useQuery({
    queryKey: expenseKeys.vendors(params),
    queryFn: () => http.get<Vendor[]>("/vendors", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useCreateVendor() {
  return useApiMutation({
    mutationFn: async (input: VendorInput) => (await http.post<Vendor>("/vendors", input)).data,
    invalidate: [expenseKeys.all],
    success: (vendor) => `${vendor.name} added`,
    toastError: false,
  });
}
