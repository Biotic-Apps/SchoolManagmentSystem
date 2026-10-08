"use client";

import { ErrorState } from "@/components/shared/ErrorState";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useBellScheduleQuery } from "../bell-api";
import { BellScheduleEditor } from "./BellScheduleEditor";
import { BellScheduleList } from "./BellScheduleList";

interface BellScheduleTabProps {
  branchId: string;
  canEdit: boolean;
}

export function BellScheduleTab({ branchId, canEdit }: BellScheduleTabProps) {
  const query = useBellScheduleQuery(branchId);

  if (query.isLoading) return <Skeleton className="h-64 w-full" />;
  if (query.error)
    return (
      <Card>
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </Card>
    );
  const bell = query.data ?? null;
  return canEdit ? (
    // Remount on fresh data so the form starts from what was saved.
    <BellScheduleEditor key={`${branchId}-${query.dataUpdatedAt}`} branchId={branchId} bell={bell} />
  ) : (
    <BellScheduleList bell={bell} />
  );
}
