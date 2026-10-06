"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/Button";
import { feeHeadColumns } from "../../fee-head-columns";
import type { FeeStructureTab } from "../../use-fee-structure-tab";

export function FeeHeadsSection({ tab }: { tab: FeeStructureTab }) {
  const columns = useMemo(() => feeHeadColumns(), []);
  return (
    <section className="flex flex-col gap-3">
      <SectionHeading
        title="Fee heads"
        actions={
          tab.canAdd && (
            <Button size="sm" onClick={() => tab.headDialog.show()} disabled={!tab.schoolId}>
              <Plus />
              Add fee head
            </Button>
          )
        }
      />
      <DataTable
        columns={columns}
        rows={tab.heads.data}
        getRowId={(row) => row.id}
        loading={tab.heads.isLoading}
        error={tab.heads.error}
        onRetry={() => tab.heads.refetch()}
        skeletonRows={3}
        emptyTitle="No fee heads yet"
        emptyDescription="Fee heads such as Tuition or Transport are shared by every branch of the school."
      />
    </section>
  );
}
