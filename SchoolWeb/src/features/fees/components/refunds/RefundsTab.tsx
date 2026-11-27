"use client";

import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { CONCESSION_STATUS_OPTIONS } from "../../concession-options";
import { useRefundsTab } from "../../use-refunds-tab";

export function RefundsTab({ branchId }: { branchId: string | null }) {
  const tab = useRefundsTab(branchId);
  const { list, query } = tab;

  return (
    <div className="flex flex-col gap-4">
      <FilterBar onReset={list.reset}>
        <FilterSelect
          label="Status"
          options={CONCESSION_STATUS_OPTIONS}
          value={list.filters.status}
          onChange={(value) => list.setFilter("status", value)}
        />
      </FilterBar>
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyTitle="No refunds"
        emptyDescription="Refunds requested from the Payments tab appear here with their approval status."
        pagination={tab.pagination}
      />
    </div>
  );
}
