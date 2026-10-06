"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { Button } from "@/components/ui/Button";
import { ITEM_CATEGORY_OPTIONS } from "../options";
import { useItemsTab } from "../use-items-tab";
import { ItemFormDialog } from "./ItemFormDialog";

export function ItemsTab({ branchId, schoolId }: { branchId: string; schoolId: string | null }) {
  const tab = useItemsTab(branchId, schoolId);
  const { list, query } = tab;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <FilterBar>
          <FilterSelect
            label="Category"
            allLabel="All categories"
            options={ITEM_CATEGORY_OPTIONS}
            value={list.filters.category}
            onChange={(value) => list.setFilter("category", value)}
          />
        </FilterBar>
        {tab.canAdd && (
          <Button onClick={() => tab.composer.show(true)}>
            <Plus />
            Add item
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
        emptyTitle="No items"
        emptyDescription="Furniture, stationery, uniforms, books and other stock items appear here."
        pagination={tab.pagination}
      />
      {tab.composer.open && schoolId && <ItemFormDialog schoolId={schoolId} onClose={tab.composer.close} />}
    </div>
  );
}
