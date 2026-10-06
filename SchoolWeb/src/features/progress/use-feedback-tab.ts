import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { useProgressNotes } from "./api";
import { useSectionStudents } from "./use-section-students";

/** Staff: pick a student of the section, read and add feedback notes. */
export function useFeedbackTab(sectionId: string | null) {
  const can = useCan();
  const { query: studentsQuery, students } = useSectionStudents(sectionId);
  const [chosenId, setStudentId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const student = students.find((item) => item.id === chosenId) ?? null;
  const notes = useProgressNotes(student?.id ?? null);

  return {
    studentsQuery,
    students,
    student,
    selectStudent: setStudentId,
    notes,
    canAdd: can("progress.edit") && !!student,
    adding,
    setAdding,
  };
}
