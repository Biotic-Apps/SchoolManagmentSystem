"use client";

import { DataTable } from "@/components/shared/DataTable";
import type { SyllabusScope } from "../use-book-lists-tab";
import { useCoverageTab } from "../use-coverage-tab";

export function CoverageTab(props: SyllabusScope & { schoolId: string | null }) {
  const tab = useCoverageTab(props);
  return (
    <DataTable
      columns={tab.columns}
      rows={tab.rows}
      getRowId={(row) => `${row.sectionId}:${row.subjectId}`}
      loading={tab.loading}
      error={tab.query.error}
      onRetry={() => tab.query.refetch()}
      emptyTitle={tab.hasSession ? "No approved plans to measure" : "No academic session"}
      emptyDescription={
        tab.hasSession
          ? "Coverage appears once syllabus plans are approved for the sections in scope."
          : "Create a session in Sessions & Calendar first."
      }
    />
  );
}
