"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/Button";
import { useIncomeCategoriesTab } from "../use-categories-tab";
import { IncomeCategoryFormDialog } from "./IncomeCategoryFormDialog";

export function IncomeCategoriesTab({ schoolId }: { schoolId: string | null }) {
  const tab = useIncomeCategoriesTab(schoolId);
  const { query } = tab;

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        title="Income categories for this school"
        actions={
          tab.canAdd && (
            <Button onClick={() => tab.composer.show(true)}>
              <Plus />
              Add category
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
        emptyTitle="No categories"
        emptyDescription="Categories group income like donations, rent and event fees."
      />
      {tab.composer.open && <IncomeCategoryFormDialog schoolId={schoolId} onClose={tab.composer.close} />}
    </div>
  );
}
