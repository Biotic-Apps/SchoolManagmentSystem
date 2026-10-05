import { useQuery } from "@tanstack/react-query";
import type { AuditTimelineEntry } from "@/components/shared/AuditTimeline";
import { auditChanges } from "@/lib/audit-diff";
import { http } from "@/lib/http";
import type { AuditLog } from "./types";

function onBehalfName(value: AuditLog["onBehalfOf"]): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.name;
}

function toEntry(log: AuditLog): AuditTimelineEntry {
  return {
    id: log.id,
    action: log.action,
    actorName: log.actor?.name ?? "System",
    onBehalfOfName: onBehalfName(log.onBehalfOf),
    at: log.at,
    changes: auditChanges(log.before, log.after),
  };
}

export function useAuditLog(entityType: string, entityId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["audit", entityType, entityId],
    queryFn: async () => (await http.get<AuditLog[]>("/audit", { entityType, entityId, pageSize: 50 })).data.map(toEntry),
    enabled: enabled && !!entityId,
  });
}
