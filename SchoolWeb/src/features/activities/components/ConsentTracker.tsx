"use client";

import { DataTable } from "@/components/shared/DataTable";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { useActivityConsents } from "../api";
import { CONSENT_COLUMNS } from "../consent-columns";

export function ConsentTracker({ activityId }: { activityId: string }) {
  const query = useActivityConsents(activityId);
  const counts = query.data?.counts;

  return (
    <section className="flex flex-col gap-3">
      <SectionHeading title="Parent consent" />
      {counts && (
        <div className="flex flex-wrap gap-2">
          <Badge tone="success">{counts.granted} granted</Badge>
          <Badge tone="error">{counts.declined} declined</Badge>
          <Badge tone="warning">{counts.pending} pending</Badge>
        </div>
      )}
      <DataTable
        columns={CONSENT_COLUMNS}
        rows={query.data?.consents}
        getRowId={(row) => row.student.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        skeletonRows={3}
        emptyTitle="No consent requests"
        emptyDescription="Requests go to parents when the activity is announced."
      />
    </section>
  );
}
