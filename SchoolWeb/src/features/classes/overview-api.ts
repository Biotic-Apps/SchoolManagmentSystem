import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { classKeys } from "./api";
import type { ClassOverview } from "./setup-types";

export const overviewKey = (branchId: string | null, sessionId: string | null) =>
  ["classes", "overview", branchId ?? "", sessionId ?? ""] as const;

export function useClassesOverview(branchId: string | null, sessionId: string | null) {
  return useQuery({
    queryKey: overviewKey(branchId, sessionId),
    queryFn: async () => (await http.get<ClassOverview[]>("/classes/overview", { branchId, sessionId })).data ?? [],
    enabled: !!branchId,
    placeholderData: keepPreviousData,
  });
}

/** All classes of the school in their new order → levelOrder 1..n. */
export function useReorderClasses() {
  return useApiMutation({
    mutationFn: (classIds: string[]) => http.put("/classes/order", { classIds }),
    invalidate: [classKeys.all],
    success: "Class order saved",
  });
}
