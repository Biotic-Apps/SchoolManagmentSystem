import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useCan } from "@/features/auth/use-can";
import { userKeys } from "@/features/users/api";
import type { UserDetail } from "@/features/users/types";
import { referencedUserIds, type NameLookup } from "@/lib/audit/summary";
import { http } from "@/lib/http";
import type { AuditLog } from "./types";

/**
 * Resolves user ids mentioned in audit entries (e.g. a new principal) to names: first from
 * names the page already knows, then by looking the user up when the viewer may see users.
 */
export function useAuditNames(logs: AuditLog[], known: Record<string, string> = {}): NameLookup {
  const can = useCan();
  const missing = useMemo(() => {
    const ids = new Set(logs.flatMap((log) => referencedUserIds(log.action, log.before, log.after)));
    return [...ids].filter((id) => !known[id]);
  }, [logs, known]);

  const results = useQueries({
    queries: missing.map((id) => ({
      queryKey: userKeys.detail(id),
      queryFn: async () => (await http.get<UserDetail>(`/users/${id}`)).data,
      enabled: can("users.view"),
      retry: false,
      staleTime: 5 * 60_000,
    })),
  });

  const names = new Map(Object.entries(known));
  missing.forEach((id, index) => {
    const name = results[index]?.data?.name;
    if (name) names.set(id, name);
  });
  return (id: string) => names.get(id);
}
