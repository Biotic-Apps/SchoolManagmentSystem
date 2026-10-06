"use client";

import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import type { Guardian } from "../types";
import { useGuardiansTab } from "../use-guardians-tab";

export function GuardiansTab({ branchId, onOpen }: { branchId: string; onOpen: (guardian: Guardian) => void }) {
  const tab = useGuardiansTab(branchId);
  const { list, query } = tab;

  return (
    <div className="flex flex-col gap-4">
      <FilterBar
        search={{ value: list.search, onChange: list.setSearch, placeholder: "Search name, phone or email" }}
        onReset={list.reset}
      />
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={onOpen}
        emptyTitle="No guardians found"
        emptyDescription="Guardians are added with admissions or from a student page."
        pagination={tab.pagination}
      />
    </div>
  );
}
