"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import { questionColumns } from "../question-columns";
import { QUESTION_TYPE_OPTIONS, DIFFICULTY_OPTIONS } from "../options";
import { useQuestionsPage } from "../use-questions-page";
import { QuestionFormDialog } from "./QuestionFormDialog";

export function QuestionsPage() {
  const page = useQuestionsPage();

  return (
    <>
      <PageHeader
        title="Question Bank"
        description="Build and manage a bank of questions per subject and class. Use them to auto-generate exam papers."
        actions={
          page.canAdd && page.schoolId && (
            <Button onClick={() => page.showForm()}>
              <Plus />
              Add question
            </Button>
          )
        }
      />
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <BranchPickerSelect picker={page.picker} />
        <FilterSelect label="Subject" options={page.subjectOptions} value={page.subjectId} onChange={page.setSubjectId} />
        <FilterSelect label="Class" options={page.classOptions} value={page.classId} onChange={page.setClassId} />
        <FilterSelect label="Type" options={QUESTION_TYPE_OPTIONS} value={page.questionType} onChange={page.setQuestionType} />
        <FilterSelect label="Difficulty" options={DIFFICULTY_OPTIONS} value={page.difficulty} onChange={page.setDifficulty} />
      </div>
      <DataTable
        columns={questionColumns()}
        rows={page.rows}
        getRowId={(row) => row.id}
        loading={page.query.isLoading}
        error={page.query.error}
        onRetry={() => page.query.refetch()}
        onRowClick={(row) => page.canEdit && page.showForm(row)}
        emptyTitle="No questions"
        emptyDescription="Add questions to your bank using the button above."
      />
      {page.isFormOpen && page.schoolId && (
        <QuestionFormDialog
          question={page.editingQuestion}
          schoolId={page.schoolId}
          classOptions={page.classOptions}
          subjectOptions={page.subjectOptions}
          onClose={page.closeForm}
        />
      )}
    </>
  );
}
