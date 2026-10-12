import { useState } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { OPTIONS_PAGE } from "@/config/options";
import { useBranchPicker } from "@/features/branches/use-branch-picker";
import { useClassOptions } from "@/features/classes/api";
import { useSubjects } from "@/features/classes/subjects-api";
import { useCan } from "@/features/auth/use-can";
import { useQuestions, useDeleteQuestion } from "./api";
import type { Question } from "./types";

export function useQuestionsPage() {
  const can = useCan();
  const picker = useBranchPicker();
  const schoolId = picker.schoolId;

  const classOpts = useClassOptions(schoolId);
  const subjectsQuery = useSubjects({ ...OPTIONS_PAGE, schoolId }, !!schoolId);
  const subjectOptions: Option[] = (subjectsQuery.data?.data ?? []).map((s) => ({ id: s.id, name: s.name }));

  const [subjectId, setSubjectId] = useState<string | undefined>(undefined);
  const [classId, setClassId] = useState<string | undefined>(undefined);
  const [questionType, setQuestionType] = useState<string | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<string | undefined>(undefined);

  const query = useQuestions(
    {
      schoolId,
      subjectId,
      classId,
      questionType,
      difficultyLevel: difficulty,
      pageSize: 50,
    },
    !!schoolId,
  );

  const canAdd = can("questions.add");
  const canEdit = can("questions.edit");
  const canDelete = can("questions.delete");
  const deleteQuestion = useDeleteQuestion();

  // Composer state for the form dialog
  const [editing, setEditing] = useState<Question | null | "new">(null);
  const showForm = (question?: Question) => setEditing(question ?? "new");
  const closeForm = () => setEditing(null);

  return {
    picker,
    schoolId,
    classOptions: classOpts.options,
    subjectOptions,
    subjectId,
    setSubjectId,
    classId,
    setClassId,
    questionType,
    setQuestionType,
    difficulty,
    setDifficulty,
    query,
    rows: query.data ?? [],
    canAdd,
    canEdit,
    canDelete,
    deleteQuestion,
    editing,
    editingQuestion: editing === "new" ? null : editing,
    showForm,
    closeForm,
    isFormOpen: editing !== null,
  };
}
