"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { Button } from "@/components/ui/Button";
import { PURCHASE_REQUEST_STATUS_OPTIONS } from "../options";
import { usePurchasingTab } from "../use-purchasing-tab";
import { PurchaseDetailDrawer } from "./PurchaseDetailDrawer";
import { PurchaseRequestFormDialog } from "./PurchaseRequestFormDialog";

export function PurchasingTab({ branchId }: { branchId: string }) {
  const tab = usePurchasingTab(branchId);
  const { list, query, composer } = tab;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <FilterBar>
          <FilterSelect
            label="Status"
            options={PURCHASE_REQUEST_STATUS_OPTIONS}
            value={list.filters.status}
            onChange={(value) => list.setFilter("status", value)}
          />
        </FilterBar>
        {tab.canRequest && (
          <Button onClick={() => composer.show(true)}>
            <Plus />
            New purchase request
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
        onRowClick={tab.open}
        emptyTitle="No purchase requests"
        emptyDescription="Requests, their approval and purchase orders appear here."
        pagination={tab.pagination}
      />
      {composer.open && (
        <PurchaseRequestFormDialog branchId={branchId} itemOptions={tab.lookups.itemOptions} onClose={composer.close} />
      )}
      <PurchaseDetailDrawer request={tab.selected} lookups={tab.lookups} onClose={tab.close} />
    </div>
  );
}
