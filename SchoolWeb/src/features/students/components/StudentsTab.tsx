"use client";

import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { STUDENT_STATUS_OPTIONS } from "../options";
import { useStudentsTab } from "../use-students-tab";

interface StudentsTabProps {
  branchId: string;
  sessionId: string;
  classId: string | undefined;
}

export function StudentsTab(props: StudentsTabProps) {
  const tab = useStudentsTab(props);
  const { list, query } = tab;

  return (
    <div className="flex flex-col gap-4">
      <FilterBar
        search={{ value: list.search, onChange: list.setSearch, placeholder: "Search name or admission no" }}
        onReset={list.reset}
      >
        {tab.showSectionFilter && (
          <FilterSelect
            label="Section"
            options={tab.sectionOptions}
            value={list.filters.sectionId}
            onChange={(value) => list.setFilter("sectionId", value)}
          />
        )}
        <FilterSelect
          label="Status"
          allLabel="All statuses"
          options={STUDENT_STATUS_OPTIONS}
          value={list.filters.status}
          onChange={(value) => list.setFilter("status", value)}
        />
      </FilterBar>
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={tab.openStudent}
        emptyTitle="No students found"
        emptyDescription="Try other filters, or register a student."
        pagination={tab.pagination}
      />
    </div>
  );
}
