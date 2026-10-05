"use client";

import { AuditTimeline } from "@/components/shared/AuditTimeline";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { useCan } from "@/features/auth/use-can";
import { useAuditLog } from "../api";

interface EntityHistoryProps {
  entityType: string;
  entityId: string | null;
}

/** AuditTimeline for one record (GET /audit?entityType&entityId); hidden without audit.view. */
export function EntityHistory({ entityType, entityId }: EntityHistoryProps) {
  const can = useCan();
  const allowed = can("audit.view");
  const query = useAuditLog(entityType, entityId, allowed);
  if (!allowed) return null;

  return (
    <section className="flex flex-col gap-3">
      <SectionHeading title="History" />
      <AuditTimeline entries={query.data} loading={query.isLoading} error={query.error} onRetry={() => query.refetch()} />
    </section>
  );
}
