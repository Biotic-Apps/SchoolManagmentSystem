import { useInfiniteQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import type { AuditLog } from "./types";

export const AUDIT_PAGE_SIZE = 20;

/** One record's audit trail, newest first, a page at a time (GET /audit?entityType&entityId). */
export function useAuditLog(entityType: string, entityId: string | null, enabled = true) {
  return useInfiniteQuery({
    queryKey: ["audit", entityType, entityId],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const result = await http.get<AuditLog[]>("/audit", { entityType, entityId, page: pageParam, pageSize: AUDIT_PAGE_SIZE });
      return { logs: result.data, meta: result.meta };
    },
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((sum, page) => sum + page.logs.length, 0);
      const total = last.meta?.total;
      const more = total !== undefined ? loaded < total : last.logs.length >= AUDIT_PAGE_SIZE;
      return more && last.logs.length > 0 ? pages.length + 1 : undefined;
    },
    enabled: enabled && !!entityId,
  });
}
