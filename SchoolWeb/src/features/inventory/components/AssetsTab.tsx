"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/Button";
import { useAssetsTab } from "../use-assets-tab";
import { AssetFormDialog } from "./AssetFormDialog";

export function AssetsTab({ branchId }: { branchId: string }) {
  const tab = useAssetsTab(branchId);
  const { query, composer } = tab;

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        title="Tagged assets"
        actions={
          tab.canEdit && (
            <Button onClick={() => composer.show()}>
              <Plus />
              Add asset
            </Button>
          )
        }
      />
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={tab.canEdit ? (row) => composer.show(row) : undefined}
        emptyTitle="No assets"
        emptyDescription="Furniture, computers and other tagged equipment appear here."
        pagination={tab.pagination}
      />
      {composer.open && (
        <AssetFormDialog
          branchId={branchId}
          asset={composer.item}
          itemOptions={tab.lookups.assetOptions}
          onClose={composer.close}
        />
      )}
    </div>
  );
}
