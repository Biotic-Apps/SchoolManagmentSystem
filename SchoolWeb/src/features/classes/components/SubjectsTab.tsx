"use client";

import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { useSubjectsTab } from "../use-subjects-tab";
import { SubjectFormDialog } from "./SubjectFormDialog";
import { TabToolbar } from "./TabToolbar";

interface SubjectsTabProps {
  schoolId: string;
  branchId: string;
  sessionId: string | null;
}

export function SubjectsTab({ schoolId, branchId, sessionId }: SubjectsTabProps) {
  const tab = useSubjectsTab(schoolId, branchId, sessionId);
  const { list, query } = tab;

  return (
    <section className="flex min-w-0 flex-col gap-3" aria-labelledby="subjects-heading">
      <h2 id="subjects-heading" className="text-card-title font-semibold text-fg">
        Subjects
      </h2>
      <TabToolbar addLabel="Add subject" onAdd={tab.canAdd ? () => tab.form.show() : undefined}>
        <FilterBar search={{ value: list.search, onChange: list.setSearch, placeholder: "Search subjects" }} />
      </TabToolbar>
      <DataTable
        stickyHeader
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyTitle="No subjects yet"
        emptyDescription="Subjects are usually added from a class's setup screen."
        pagination={tab.pagination}
      />
      {tab.form.open && <SubjectFormDialog item={tab.form.item} schoolId={schoolId} onClose={tab.form.close} />}
    </section>
  );
}
