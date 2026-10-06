"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { Button } from "@/components/ui/Button";
import { CONCESSION_STATUS_OPTIONS } from "../../concession-options";
import { useConcessionsTab } from "../../use-concessions-tab";
import { ConcessionFormDialog } from "./ConcessionFormDialog";

export function ConcessionsTab({ branchId }: { branchId: string | null }) {
  const tab = useConcessionsTab(branchId);
  const { list, query, request } = tab;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <FilterBar onReset={list.reset}>
          <FilterSelect
            label="Status"
            options={CONCESSION_STATUS_OPTIONS}
            value={list.filters.status}
            onChange={(value) => list.setFilter("status", value)}
          />
        </FilterBar>
        {tab.canAdd && (
          <Button onClick={() => request.show()}>
            <Plus />
            Request concession
          </Button>
        )}
      </div>
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyTitle="No concessions"
        emptyDescription="Scholarships and discounts appear here once requested."
        pagination={tab.pagination}
      />
      <ConcessionFormDialog branchId={branchId} open={request.open} onOpenChange={request.onOpenChange} />
    </div>
  );
}
