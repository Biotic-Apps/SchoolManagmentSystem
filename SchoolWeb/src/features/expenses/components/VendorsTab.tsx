"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { Button } from "@/components/ui/Button";
import { useVendorsTab } from "../use-vendors-tab";
import { VendorFormDialog } from "./VendorFormDialog";

export function VendorsTab({ schoolId }: { schoolId: string | null }) {
  const tab = useVendorsTab(schoolId);
  const { list, query } = tab;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <FilterBar search={{ value: list.search, onChange: list.setSearch, placeholder: "Search vendors" }} />
        {tab.canAdd && (
          <Button onClick={() => tab.composer.show(true)}>
            <Plus />
            Add vendor
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
        emptyTitle="No vendors"
        emptyDescription="Suppliers you buy from or pay bills to appear here."
        pagination={tab.pagination}
      />
      {tab.composer.open && <VendorFormDialog schoolId={schoolId} onClose={tab.composer.close} />}
    </div>
  );
}
