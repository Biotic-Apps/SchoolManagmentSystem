"use client";

import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { RECORD_STATUS_OPTIONS } from "@/config/options";
import type { BranchesPageState } from "../use-branches-page";
import { BranchDetailDrawer } from "./BranchDetailDrawer";
import { BranchFormDialog } from "./BranchFormDialog";
import { BranchSettingsDialog } from "./BranchSettingsDialog";
import { BranchStatusDialog } from "./BranchStatusDialog";
import { BranchTimingsDialog } from "./BranchTimingsDialog";
import { ChangePrincipalDialog } from "./ChangePrincipalDialog";

export function BranchesList({ page }: { page: BranchesPageState }) {
  const { list, query, perms } = page;

  return (
    <div className="flex flex-col gap-4">
      <FilterBar
        search={{ value: list.search, onChange: list.setSearch, placeholder: "Search by name or code" }}
        onReset={list.reset}
      >
        {page.showSchoolFilter && (
          <FilterSelect
            label="School"
            allLabel="All schools"
            options={page.schoolOptions}
            value={list.filters.schoolId}
            onChange={(value) => list.setFilter("schoolId", value)}
          />
        )}
        <FilterSelect
          label="Status"
          options={RECORD_STATUS_OPTIONS}
          value={list.filters.status}
          onChange={(value) => list.setFilter("status", value)}
        />
      </FilterBar>
      <DataTable
        columns={page.columns}
        rows={page.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={page.detail.show}
        emptyTitle="No branches found"
        emptyDescription={perms.canAdd ? "Add a branch to a school to get started." : undefined}
        pagination={page.pagination}
      />
      {page.form.open && (
        <BranchFormDialog
          branch={page.form.item}
          defaultSchoolId={list.filters.schoolId ?? null}
          onClose={page.form.close}
        />
      )}
      {page.principal.item && <ChangePrincipalDialog branch={page.principal.item} onClose={page.principal.close} />}
      {page.timings.item && <BranchTimingsDialog branch={page.timings.item} onClose={page.timings.close} />}
      {page.settings.item && <BranchSettingsDialog branch={page.settings.item} onClose={page.settings.close} />}
      <BranchStatusDialog branch={page.statusTarget.item} onClose={page.statusTarget.close} />
      <BranchDetailDrawer
        branch={page.detail.item}
        onClose={page.detail.close}
        onEdit={perms.canEdit ? page.form.show : undefined}
        onEditTimings={perms.canEditTimings ? page.timings.show : undefined}
        onChangePrincipal={perms.canChangePrincipal ? page.principal.show : undefined}
        onSettings={perms.canEditSettings ? page.settings.show : undefined}
      />
    </div>
  );
}
