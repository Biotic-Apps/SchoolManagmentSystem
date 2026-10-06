"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { SectionHeading } from "@/components/shared/SectionHeading";
import type { ApiResult } from "@/lib/http";
import { useDialogState } from "@/lib/use-dialog-state";
import type { IncidentDetail } from "../types";
import { IncidentDetailDrawer } from "./IncidentDetailDrawer";

interface StudentIncidentsCardProps {
  query: UseQueryResult<ApiResult<IncidentDetail[]>>;
  columns: DataTableColumn<IncidentDetail>[];
}

export function StudentIncidentsCard({ query, columns }: StudentIncidentsCardProps) {
  const detail = useDialogState<IncidentDetail>();
  return (
    <section className="flex flex-col gap-3">
      <SectionHeading title="Recent incidents" />
      <DataTable
        columns={columns}
        rows={query.data?.data}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={detail.show}
        skeletonRows={2}
        emptyTitle="No incidents recorded"
      />
      <IncidentDetailDrawer incident={detail.item} open={detail.open} onOpenChange={detail.onOpenChange} />
    </section>
  );
}
