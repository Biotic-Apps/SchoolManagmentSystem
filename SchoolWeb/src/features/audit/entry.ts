import type { AuditTimelineEntry } from "@/components/shared/AuditTimeline";
import { actionKind } from "@/lib/audit/actions";
import { summariseAudit, type NameLookup } from "@/lib/audit/summary";
import type { AuditLog } from "./types";

function onBehalfName(value: AuditLog["onBehalfOf"]): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.name;
}

/** API audit log → timeline entry with a plain-language title and readable changes. */
export function toTimelineEntry(log: AuditLog, lookup: NameLookup): AuditTimelineEntry {
  const { title, changes } = summariseAudit(log.action, log.before, log.after, lookup);
  return {
    id: log.id,
    action: log.action,
    title,
    kind: actionKind(log.action),
    actorName: log.actor?.name ?? "System",
    onBehalfOfName: onBehalfName(log.onBehalfOf),
    at: log.at,
    changes,
  };
}
