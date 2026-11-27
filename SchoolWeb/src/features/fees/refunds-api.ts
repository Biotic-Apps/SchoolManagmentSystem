import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { feesKeys } from "./keys";
import type { Refund } from "./types";

/** GET /refunds: refund requests of the branch, newest first. */
export function useRefunds(params: Query, enabled = true) {
  return useQuery({
    queryKey: feesKeys.refunds(params),
    queryFn: () => http.get<Refund[]>("/refunds", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}
