"use client";

import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { useSubjectsTab } from "../use-subjects-tab";
import { SubjectFormDialog } from "./SubjectFormDialog";
import { TabToolbar } from "./TabToolbar";

export function SubjectsTab({ schoolId }: { schoolId: string }) {
  const tab = useSubjectsTab(schoolId);
  const { list, query } = tab;

  return (
    <div className="flex flex-col gap-4">
      <TabToolbar addLabel="Add subject" onAdd={tab.canAdd ? () => tab.form.show() : undefined}>
        <FilterBar search={{ value: list.search, onChange: list.setSearch, placeholder: "Search by code or name" }} />
      </TabToolbar>
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyTitle="No subjects yet"
        emptyDescription="Add the subjects taught at this school, then map them to classes."
        pagination={tab.pagination}
      />
      {tab.form.open && <SubjectFormDialog item={tab.form.item} schoolId={schoolId} onClose={tab.form.close} />}
    </div>
  );
}
