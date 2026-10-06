"use client";

import { DataTable } from "@/components/shared/DataTable";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { OptionSelect } from "@/components/shared/OptionSelect";
import { resultColumns } from "../../result-columns";
import type { Exam } from "../../types";
import { useResultsTab } from "../../use-results-tab";
import { StudentResultDrawer } from "./StudentResultDrawer";

export function ResultsTab({ exam }: { exam: Exam }) {
  const tab = useResultsTab(exam);

  return (
    <div className="flex flex-col gap-4">
      {exam.status === "MARKS_CLOSED" && (
        <InlineNotice tone="warning">These results are not approved yet. Parents see them only after publishing.</InlineNotice>
      )}
      <OptionSelect
        label={tab.sectionsLoading ? "Loading sections" : "Section"}
        options={tab.options}
        value={tab.sectionId}
        onChange={tab.setSectionId}
        className="md:w-64"
      />
      <DataTable
        columns={resultColumns()}
        rows={tab.rows}
        getRowId={(row) => row.studentId}
        loading={tab.sectionsLoading || tab.query.isLoading}
        error={tab.query.error}
        onRetry={() => tab.query.refetch()}
        onRowClick={tab.openStudent}
        emptyTitle={tab.sectionId ? "No results for this section" : "No sections"}
        emptyDescription={tab.sectionId ? "Compute results once all mark sheets are accepted." : "This exam has no active sections."}
      />
      <StudentResultDrawer
        studentId={tab.studentId}
        examId={exam.id}
        open={!!tab.studentId}
        onOpenChange={(open) => !open && tab.closeStudent()}
      />
    </div>
  );
}
