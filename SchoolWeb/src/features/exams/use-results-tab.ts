import { useState } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { useSectionOptions } from "@/features/classes/sections-api";
import { useSectionResults } from "./results-api";
import type { Exam, StudentResult } from "./types";

/** Section results of an exam; a row opens the student's result drawer. */
export function useResultsTab(exam: Exam) {
  const sections = useSectionOptions(exam.branchId, exam.sessionId);
  const classIds = new Set(exam.classIds ?? exam.classes?.map((item) => item.id) ?? []);
  const options: Option[] = sections.sections
    .filter((section) => classIds.has(section.classId))
    .map((section) => ({ id: section.id, name: `${section.className} ${section.name}` }));

  const [chosen, setSectionId] = useState<string | null>(null);
  const sectionId = chosen && options.some((option) => option.id === chosen) ? chosen : (options[0]?.id ?? null);
  const query = useSectionResults(exam.id, sectionId);
  const [studentId, setStudentId] = useState<string | null>(null);

  return {
    options,
    sectionsLoading: sections.isLoading,
    sectionId,
    setSectionId,
    query,
    rows: query.data ?? [],
    studentId,
    openStudent: (row: StudentResult) => setStudentId(row.studentId),
    closeStudent: () => setStudentId(null),
  };
}
