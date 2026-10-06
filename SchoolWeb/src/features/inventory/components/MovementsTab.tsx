"use client";

import { ArrowLeftRight } from "lucide-react";
import type { Option } from "@/components/shared/OptionSelect";
import { DataTable } from "@/components/shared/DataTable";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/Button";
import { useMovementsTab } from "../use-movements-tab";
import { MovementFormDialog } from "./MovementFormDialog";
import { StockTab } from "./StockTab";

export function MovementsTab({ branchId, branchOptions }: { branchId: string; branchOptions: Option[] }) {
  const tab = useMovementsTab(branchId);
  const { movements } = tab;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4">
        <SectionHeading
          title="Current stock"
          actions={
            tab.canRecord && (
              <Button onClick={() => tab.composer.show(true)}>
                <ArrowLeftRight />
                Record movement
              </Button>
            )
          }
        />
        <StockTab branchId={branchId} />
      </section>
      {tab.showHistory && (
        <section className="flex flex-col gap-4">
          <SectionHeading title="Recent movements" />
          <DataTable
            columns={tab.columns}
            rows={movements.data ?? undefined}
            getRowId={(row) => row.id}
            loading={movements.isLoading}
            error={movements.error}
            onRetry={() => movements.refetch()}
            emptyTitle="No movements yet"
            emptyDescription="Stock in, issues, adjustments and transfers appear here."
          />
        </section>
      )}
      {tab.composer.open && (
        <MovementFormDialog
          branchId={branchId}
          itemOptions={tab.lookups.itemOptions}
          branchOptions={branchOptions}
          onClose={tab.composer.close}
        />
      )}
    </div>
  );
}
