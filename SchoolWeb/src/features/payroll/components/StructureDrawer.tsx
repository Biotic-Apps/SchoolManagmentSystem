"use client";

import { Pencil, WalletCards } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { designationLabel } from "@/features/staff/options";
import type { StaffSummary } from "@/features/staff/types";
import { structureHistoryColumns } from "../structure-columns";
import { useStructureDetail } from "../use-structure-detail";
import { StructureFormDialog } from "./StructureFormDialog";
import { StructureSummary } from "./StructureSummary";

export function StructureDrawer({ staff, onClose }: { staff: StaffSummary | null; onClose: () => void }) {
  const detail = useStructureDetail(staff?.id ?? null);
  const { query, current } = detail;

  return (
    <DetailDrawer
      open={!!staff}
      onOpenChange={(open) => !open && onClose()}
      title={staff ? `Salary · ${staff.name}` : "Salary"}
      description={staff && designationLabel(staff.designation)}
      actions={
        detail.canEdit &&
        query.isSuccess && (
          <Button onClick={() => detail.edit.show(true)}>
            <Pencil />
            Edit structure
          </Button>
        )
      }
    >
      {query.isLoading && <Skeleton className="h-64 w-full" />}
      {!!query.error && <ErrorState error={query.error} onRetry={() => query.refetch()} />}
      {query.isSuccess && !current && (
        <EmptyState
          icon={WalletCards}
          title="No salary structure yet"
          description="Add basic salary, allowances and deductions before running payroll."
        />
      )}
      {current && <StructureSummary structure={current} />}
      {detail.history.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeading title="Earlier structures" />
          <DataTable columns={structureHistoryColumns} rows={detail.history} getRowId={(row) => row.id ?? row.effectiveFrom} />
        </section>
      )}
      {staff && detail.edit.open && (
        <StructureFormDialog staffId={staff.id} staffName={staff.name} current={current} onClose={detail.edit.close} />
      )}
    </DetailDrawer>
  );
}
