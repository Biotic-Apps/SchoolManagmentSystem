"use client";

import { ArrowLeft } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { useGuardedAction } from "@/components/shared/UnsavedChangesGuard";
import { Button } from "@/components/ui/Button";
import type { Exam } from "../../types";
import { useMarkSheetsTab } from "../../use-mark-sheets-tab";
import { MarkSheetEditor } from "./MarkSheetEditor";

/** Mark sheets of an exam; clicking one opens its marks grid in place. */
export function MarkSheetsTab({ exam }: { exam: Exam }) {
  const tab = useMarkSheetsTab(exam);
  const guard = useGuardedAction();
  const { list, query } = tab;

  if (tab.openId) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <Button variant="ghost" onClick={() => guard(tab.close)}>
            <ArrowLeft />
            Back to mark sheets
          </Button>
        </div>
        <MarkSheetEditor key={tab.openId} exam={exam} sheetId={tab.openId} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <FilterBar onReset={list.reset}>
        <FilterSelect
          label="Section"
          options={tab.sectionOptions}
          value={list.filters.sectionId}
          onChange={(value) => list.setFilter("sectionId", value)}
        />
        <FilterSelect
          label="Subject"
          options={tab.subjectOptions}
          value={list.filters.subjectId}
          onChange={(value) => list.setFilter("subjectId", value)}
        />
      </FilterBar>
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={(row) => tab.open(row.id)}
        emptyTitle="No mark sheets"
        emptyDescription="Mark sheets appear once the exam is scheduled. Teachers see the sheets for their own subjects."
        pagination={tab.pagination}
      />
    </div>
  );
}
