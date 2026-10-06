"use client";

import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { structureStaffColumns } from "../structure-columns";
import { useStructuresTab } from "../use-structures-tab";
import { StructureDrawer } from "./StructureDrawer";

export function StructuresTab({ branchId }: { branchId: string | null }) {
  const tab = useStructuresTab(branchId);
  const { list, query } = tab;

  return (
    <div className="flex flex-col gap-4">
      <FilterBar search={{ value: list.search, onChange: list.setSearch, placeholder: "Search staff" }} />
      <DataTable
        columns={structureStaffColumns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={tab.loading}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={tab.drawer.show}
        emptyTitle="No staff found"
        emptyDescription="Active staff of this branch appear here. Select one to see their salary structure."
        pagination={tab.pagination}
      />
      <StructureDrawer staff={tab.drawer.item} onClose={tab.drawer.close} />
    </div>
  );
}
