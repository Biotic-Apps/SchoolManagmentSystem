"use client";

import { ErrorState } from "@/components/shared/ErrorState";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useBellSchedule } from "../use-bell-schedule";
import { BellScheduleEditor } from "./BellScheduleEditor";
import { BellScheduleList } from "./BellScheduleList";

interface BellScheduleTabProps {
  branchId: string;
  canEdit: boolean;
}

export function BellScheduleTab({ branchId, canEdit }: BellScheduleTabProps) {
  const { query, periods, rows, editorKey } = useBellSchedule(branchId);

  if (query.isLoading) return <Skeleton className="h-64 w-full" />;
  if (query.error)
    return (
      <Card>
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </Card>
    );
  return canEdit ? (
    <BellScheduleEditor key={editorKey} branchId={branchId} periods={periods} />
  ) : (
    <BellScheduleList rows={rows} />
  );
}
