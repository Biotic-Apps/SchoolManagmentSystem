"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useChangeRequestsTab } from "../use-change-requests-tab";

export function ChangeRequestsTab() {
  const { query, rows, columns } = useChangeRequestsTab();
  return (
    <div className="flex flex-col gap-4">
      <p className="text-label text-fg-muted">
        Parents&apos; requests to correct allergies, medicines or emergency contacts. Verify each one in Approvals.
      </p>
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyTitle="No pending change requests"
        emptyDescription="When a parent asks to update their child's health record, it waits here for verification."
      />
    </div>
  );
}
