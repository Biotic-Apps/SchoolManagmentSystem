"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { useRolesPage } from "../use-roles-page";
import { RoleDeleteDialog } from "./RoleDeleteDialog";
import { RoleFormDialog } from "./RoleFormDialog";

export function RolesPage() {
  const page = useRolesPage();
  const { query } = page;

  return (
    <>
      <PageHeader
        title="Roles & Permissions"
        description="System roles and custom roles, and what each one is allowed to do."
        actions={
          page.canAdd && (
            <Button onClick={() => page.form.show()}>
              <Plus />
              Create role
            </Button>
          )
        }
      />
      <FilterBar search={{ value: page.search, onChange: page.setSearch, placeholder: "Search by name or key" }} />
      <DataTable
        columns={page.columns}
        rows={page.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={page.form.show}
        emptyTitle="No roles found"
        emptyDescription={page.search ? "Try a different search." : "Create a custom role to get started."}
      />
      {page.form.open && <RoleFormDialog role={page.form.item} onClose={page.form.close} />}
      <RoleDeleteDialog role={page.deleteTarget.item} onClose={page.deleteTarget.close} />
    </>
  );
}
