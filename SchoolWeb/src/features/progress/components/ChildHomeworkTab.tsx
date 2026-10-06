"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { childHomeworkColumns } from "../child-homework-columns";
import { useChildHomework } from "../use-child-homework";

export function ChildHomeworkTab({ childId }: { childId: string }) {
  const { query, rows, days } = useChildHomework(childId);
  const columns = useMemo(() => childHomeworkColumns(), []);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-caption text-fg-muted">Homework from the last {days} days and whether it was done.</p>
      <DataTable
        columns={columns}
        rows={query.data ? rows : undefined}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyTitle="No homework in the last month"
        emptyDescription="Homework set in the diary appears here once teachers check it."
      />
    </div>
  );
}
