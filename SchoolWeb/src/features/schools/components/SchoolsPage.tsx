"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { RECORD_STATUS_OPTIONS } from "@/config/options";
import { SchoolSetupDialog } from "@/features/school-setup/components/SchoolSetupDialog";
import { useSchoolsPage } from "../use-schools-page";
import { SchoolDetailDrawer } from "./SchoolDetailDrawer";
import { SchoolFormDialog } from "./SchoolFormDialog";
import { SchoolStatusDialog } from "./SchoolStatusDialog";

export function SchoolsPage() {
  const page = useSchoolsPage();
  const { list, query } = page;

  return (
    <>
      <PageHeader
        title="Schools"
        description="Schools in the system, their branches and contact details."
        actions={
          page.canSetup && (
            <Button onClick={() => page.setup.show()}>
              <Plus />
              New school
            </Button>
          )
        }
      />
      <FilterBar
        search={{ value: list.search, onChange: list.setSearch, placeholder: "Search by name or code" }}
        onReset={list.reset}
      >
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
        emptyTitle="No schools found"
        emptyDescription="Use New school to set up a school, its main branch and principal in one go."
        pagination={page.pagination}
      />
      {page.setup.open && <SchoolSetupDialog onClose={page.setup.close} />}
      {page.form.open && page.form.item && <SchoolFormDialog school={page.form.item} onClose={page.form.close} />}
      <SchoolStatusDialog school={page.statusTarget.item} onClose={page.statusTarget.close} />
      <SchoolDetailDrawer
        school={page.detail.item}
        onClose={page.detail.close}
        onEdit={page.canEdit ? page.form.show : undefined}
      />
    </>
  );
}
