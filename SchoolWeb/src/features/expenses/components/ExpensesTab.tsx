"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/Button";
import { useExpensesTab } from "../use-expenses-tab";
import { ExpenseDetailDrawer } from "./ExpenseDetailDrawer";
import { ExpenseFilters } from "./ExpenseFilters";
import { ExpenseFormDialog } from "./ExpenseFormDialog";

interface ExpensesTabProps {
  branchId: string;
  schoolId: string | null;
  canAdd: boolean;
}

export function ExpensesTab({ branchId, schoolId, canAdd }: ExpensesTabProps) {
  const tab = useExpensesTab(branchId, schoolId);
  const { query, composer } = tab;

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        title="Bills and expenses"
        actions={
          canAdd && (
            <Button onClick={() => composer.show(true)}>
              <Plus />
              Add expense
            </Button>
          )
        }
      />
      <ExpenseFilters tab={tab} />
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={tab.open}
        emptyTitle="No expenses"
        emptyDescription="Bills and expenses recorded for this branch appear here."
        pagination={tab.pagination}
      />
      {composer.open && (
        <ExpenseFormDialog
          branchId={branchId}
          lookups={tab.lookups}
          onClose={composer.close}
          onSaved={(expense) => {
            composer.close();
            tab.open(expense);
          }}
        />
      )}
      <ExpenseDetailDrawer expense={tab.selected} lookups={tab.lookups} onClose={tab.close} />
    </div>
  );
}
