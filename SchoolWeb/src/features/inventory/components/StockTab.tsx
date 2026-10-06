"use client";

import { DataTable } from "@/components/shared/DataTable";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { useStockTab } from "../use-stock-tab";

export function StockTab({ branchId }: { branchId: string }) {
  const tab = useStockTab(branchId);
  const { query } = tab;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Checkbox id="stock-low-only" checked={tab.lowOnly} onCheckedChange={(checked) => tab.setLowOnly(checked === true)} />
          <Label htmlFor="stock-low-only">Low stock only</Label>
        </div>
        {!query.isLoading && !query.error && (
          <p className="text-label text-fg-muted">
            {tab.total} {tab.total === 1 ? "item" : "items"} ·{" "}
            <span className={tab.lowCount > 0 ? "font-medium text-warning" : undefined}>{tab.lowCount} low on stock</span>
          </p>
        )}
      </div>
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.itemId}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyTitle={tab.lowOnly ? "Nothing is low on stock" : "No stock yet"}
        emptyDescription={
          tab.lowOnly ? "Items at or below their reorder level appear here." : "Record stock in from the Movements tab."
        }
      />
    </div>
  );
}
