"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { Button } from "@/components/ui/Button";
import { AcademicScopeBar } from "@/features/classes/components/AcademicScopeBar";
import { examColumns } from "../../exam-columns";
import { EXAM_STATUS_OPTIONS } from "../../options";
import { useExamsTab } from "../../use-exams-tab";
import { ExamFormDialog } from "./ExamFormDialog";

export function ExamsTab() {
  const tab = useExamsTab();
  const { scope, query, editor } = tab;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <AcademicScopeBar scope={scope} />
        <FilterSelect label="Term" options={tab.termOptions} value={tab.termId} onChange={tab.setTermId} />
        <FilterSelect label="Status" options={EXAM_STATUS_OPTIONS} value={tab.status} onChange={tab.setStatus} />
        {tab.canAdd && (
          <Button onClick={() => editor.show()} className="md:ml-auto">
            <Plus />
            New exam
          </Button>
        )}
      </div>
      <DataTable
        columns={examColumns(tab.canEdit, editor.show)}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={scope.isLoading || query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={tab.open}
        pagination={tab.pagination}
        emptyTitle="No exams"
        emptyDescription="Exams created for this session appear here."
      />
      {editor.open && scope.branchId && scope.sessionId && (
        <ExamFormDialog
          exam={editor.item}
          scope={{ schoolId: scope.schoolId, branchId: scope.branchId, sessionId: scope.sessionId }}
          onClose={editor.close}
          onSaved={editor.item ? undefined : tab.open}
        />
      )}
    </div>
  );
}
