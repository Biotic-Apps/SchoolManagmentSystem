"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import { examPaperColumns } from "../exam-paper-columns";
import { usePaperGenerator } from "../use-paper-generator";
import { GeneratePaperDialog } from "./GeneratePaperDialog";
import { PaperPreviewDrawer } from "./PaperPreviewDrawer";

export function PaperGeneratorPage() {
  const page = usePaperGenerator();

  return (
    <>
      <PageHeader
        title="Paper Generator"
        description="Auto-generate printable exam papers from the question bank."
        actions={
          page.canAdd && page.schoolId && (
            <Button onClick={page.openWizard}>
              <Plus />
              Generate paper
            </Button>
          )
        }
      />
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <BranchPickerSelect picker={page.picker} />
        <FilterSelect label="Subject" options={page.subjectOptions} value={page.subjectId} onChange={page.setSubjectId} />
        <FilterSelect label="Class" options={page.classOptions} value={page.classId} onChange={page.setClassId} />
      </div>
      <DataTable
        columns={examPaperColumns()}
        rows={page.rows}
        getRowId={(row) => row.id}
        loading={page.query.isLoading}
        error={page.query.error}
        onRetry={() => page.query.refetch()}
        onRowClick={(row) => page.setPreviewPaper(row)}
        emptyTitle="No exam papers"
        emptyDescription="Generate exam papers using the question bank."
      />
      {page.wizardOpen && page.schoolId && (
        <GeneratePaperDialog
          schoolId={page.schoolId}
          classOptions={page.classOptions}
          subjectOptions={page.subjectOptions}
          onClose={page.closeWizard}
          onGenerated={(paper) => page.setPreviewPaper(paper)}
        />
      )}
      {page.previewPaper && (
        <PaperPreviewDrawer
          paper={page.previewPaper}
          onClose={() => page.setPreviewPaper(null)}
        />
      )}
    </>
  );
}
