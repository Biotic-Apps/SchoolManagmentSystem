import { useState } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { OPTIONS_PAGE } from "@/config/options";
import { useBranchPicker } from "@/features/branches/use-branch-picker";
import { useClassOptions } from "@/features/classes/api";
import { useSubjects } from "@/features/classes/subjects-api";
import { useCan } from "@/features/auth/use-can";
import { useExamPapers } from "./api";
import type { ExamPaper } from "./types";

export function usePaperGenerator() {
  const can = useCan();
  const picker = useBranchPicker();
  const schoolId = picker.schoolId;

  const classOpts = useClassOptions(schoolId);
  const subjectsQuery = useSubjects({ ...OPTIONS_PAGE, schoolId }, !!schoolId);
  const subjectOptions: Option[] = (subjectsQuery.data?.data ?? []).map((s) => ({ id: s.id, name: s.name }));

  const [subjectId, setSubjectId] = useState<string | undefined>(undefined);
  const [classId, setClassId] = useState<string | undefined>(undefined);

  const query = useExamPapers(
    { schoolId, subjectId, classId, pageSize: 50 },
    !!schoolId,
  );

  const canAdd = can("exam-papers.add");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [previewPaper, setPreviewPaper] = useState<ExamPaper | null>(null);

  return {
    picker,
    schoolId,
    classOptions: classOpts.options,
    subjectOptions,
    subjectId,
    setSubjectId,
    classId,
    setClassId,
    query,
    rows: query.data ?? [],
    canAdd,
    wizardOpen,
    openWizard: () => setWizardOpen(true),
    closeWizard: () => setWizardOpen(false),
    previewPaper,
    setPreviewPaper,
  };
}
