"use client";

import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { useClassesTab } from "../use-classes-tab";
import { ClassFormDialog } from "./ClassFormDialog";
import { ClassSubjectsDialog } from "./ClassSubjectsDialog";
import { TabToolbar } from "./TabToolbar";

export function ClassesTab({ schoolId }: { schoolId: string }) {
  const tab = useClassesTab(schoolId);
  const { list, query } = tab;

  return (
    <div className="flex flex-col gap-4">
      <TabToolbar addLabel="Add class" onAdd={tab.canAdd ? () => tab.form.show() : undefined}>
        <FilterBar search={{ value: list.search, onChange: list.setSearch, placeholder: "Search classes" }} />
      </TabToolbar>
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyTitle="No classes yet"
        emptyDescription="Classes are shared by every branch of the school, e.g. Nursery, Grade 1."
        pagination={tab.pagination}
      />
      {tab.form.open && <ClassFormDialog item={tab.form.item} schoolId={schoolId} onClose={tab.form.close} />}
      {tab.subjects.item && <ClassSubjectsDialog item={tab.subjects.item} onClose={tab.subjects.close} />}
    </div>
  );
}
