"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/Button";
import { useIncomeTab } from "../use-income-tab";
import { IncomeFormDialog } from "./IncomeFormDialog";

interface IncomeTabProps {
  branchId: string;
  schoolId: string | null;
  canAdd: boolean;
}

export function IncomeTab({ branchId, schoolId, canAdd }: IncomeTabProps) {
  const tab = useIncomeTab(branchId, schoolId);
  const { query, composer } = tab;

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        title="Other income"
        actions={
          canAdd && (
            <Button onClick={() => composer.show(true)}>
              <Plus />
              Add income
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
        emptyTitle="No income records"
        emptyDescription="Donations, rent, event fees and other income appear here."
        pagination={tab.pagination}
      />
      {composer.open && (
        <IncomeFormDialog
          branchId={branchId}
          lookups={tab.lookups}
          onClose={composer.close}
          onSaved={() => composer.close()}
        />
      )}
    </div>
  );
}
