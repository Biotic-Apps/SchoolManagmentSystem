import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { withRowFlash } from "@/lib/row-highlight";
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

/** A global admin names the school; scoped users may leave it out. */
export function useCreateVendor(schoolId: string | null = null) {
  return useApiMutation({
    mutationFn: withRowFlash(
      async (input: VendorInput) => (await http.post<Vendor>("/vendors", schoolId ? { ...input, schoolId } : input)).data,
      (vendor) => vendor.id,
    ),
    invalidate: [expenseKeys.all],
    success: (vendor) => `${vendor.name} added`,
    toastError: false,
  });
}
