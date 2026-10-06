"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/Button";
import { useCategoriesTab } from "../use-categories-tab";
import { CategoryFormDialog } from "./CategoryFormDialog";

export function CategoriesTab({ schoolId }: { schoolId: string | null }) {
  const tab = useCategoriesTab(schoolId);
  const { query } = tab;

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        title="Expense categories for this school"
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
        emptyDescription="Categories group expenses such as rent, utilities and repairs."
      />
      {tab.composer.open && <CategoryFormDialog schoolId={schoolId} onClose={tab.composer.close} />}
    </div>
  );
}
