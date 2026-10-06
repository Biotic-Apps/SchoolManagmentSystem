"use client";

import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { TabToolbar } from "@/features/classes/components/TabToolbar";
import type { AcademicScope } from "@/features/classes/use-academic-scope";
import { APPLICATION_STATUS_OPTIONS } from "../options";
import { useApplicationsTab } from "../use-applications-tab";
import { ApplicationFormDialog } from "./ApplicationFormDialog";

interface ApplicationsTabProps {
  scope: AcademicScope;
  onOpen: (applicationId: string) => void;
}

export function ApplicationsTab({ scope, onOpen }: ApplicationsTabProps) {
  const tab = useApplicationsTab(scope);
  const { list, query } = tab;

  return (
    <div className="flex flex-col gap-4">
      <TabToolbar addLabel="New application" onAdd={tab.canAdd ? () => tab.form.show(true) : undefined}>
        <FilterBar
          search={{ value: list.search, onChange: list.setSearch, placeholder: "Search application no. or name" }}
          onReset={list.reset}
        >
          <FilterSelect
            label="Status"
            options={APPLICATION_STATUS_OPTIONS}
            value={list.filters.status}
            onChange={(value) => list.setFilter("status", value)}
          />
        </FilterBar>
      </TabToolbar>
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={(row) => onOpen(row.id)}
        emptyTitle="No applications found"
        emptyDescription="Applications for the selected session appear here, from walk-ins or converted enquiries."
        pagination={tab.pagination}
      />
      {tab.form.open && tab.formContext && (
        <ApplicationFormDialog
          item={null}
          context={tab.formContext}
          classOptions={scope.classes.options}
          onClose={tab.form.close}
          onSaved={(application) => onOpen(application.id)}
        />
      )}
    </div>
  );
}
