"use client";

import { IdCard, Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { PageHeader } from "@/components/shared/PageHeader";
import { SecretRevealDialog } from "@/components/shared/SecretRevealDialog";
import { Button } from "@/components/ui/Button";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import { useStaffPage } from "../use-staff-page";
import { AddStaffDialog } from "./AddStaffDialog";
import { PrintStaffIdCardsDialog } from "./PrintStaffIdCardsDialog";

export function StaffPage() {
  const page = useStaffPage();
  const { list, query, picker } = page;

  return (
    <>
      <PageHeader
        title="Teachers & Helpers"
        description="Staff of the branch, their roles, assignments and documents."
        actions={
          <>
            <BranchPickerSelect picker={picker} />
            {page.canPrintCards && (
              <Button variant="secondary" onClick={() => page.printCards.show(true)}>
                <IdCard />
                Print ID cards
              </Button>
            )}
            {page.canAdd && (
              <Button onClick={() => page.create.show(true)}>
                <Plus />
                Add staff
              </Button>
            )}
          </>
        }
      />
      <FilterBar
        search={{ value: list.search, onChange: list.setSearch, placeholder: "Search name or employee no." }}
        onReset={list.reset}
      >
        <FilterSelect
          label="Designation"
          options={page.designationOptions}
          value={list.filters.designation}
          onChange={(value) => list.setFilter("designation", value)}
        />
        <FilterSelect
          label="Status"
          allLabel="All statuses"
          options={page.statusOptions}
          value={list.filters.status}
          onChange={(value) => list.setFilter("status", value)}
        />
      </FilterBar>
      <DataTable
        columns={page.columns}
        rows={picker.branchId ? page.rows : []}
        getRowId={(row) => row.id}
        loading={page.loading}
        error={query.error ?? picker.error}
        onRetry={() => query.refetch()}
        onRowClick={page.onRowClick}
        emptyTitle={picker.branchId ? "No staff found" : "No branch in your scope"}
        emptyDescription={
          picker.branchId ? "Try other filters, or add a staff member." : "Staff belong to a branch. Ask your administrator to assign you one."
        }
        pagination={page.pagination}
      />
      {page.create.open && picker.branchId && (
        <AddStaffDialog branchId={picker.branchId} onClose={page.create.close} onCreated={page.onCreated} />
      )}
      {page.printCards.open && picker.branchId && (
        <PrintStaffIdCardsDialog branchId={picker.branchId} onClose={page.printCards.close} />
      )}
      <SecretRevealDialog
        secret={page.revealed?.password ?? null}
        title={page.revealed?.title ?? ""}
        description="Share it with the staff member privately. It is shown only once."
        onClose={page.closeRevealed}
      />
    </>
  );
}
