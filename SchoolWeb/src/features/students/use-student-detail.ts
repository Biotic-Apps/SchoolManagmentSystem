import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { useDialogState } from "@/lib/use-dialog-state";
import { useStudent } from "./api";

export type StudentAction = "edit" | "section" | "transfer" | "withdraw";
export type StudentTabId = "profile" | "guardians" | "documents" | "enrollments" | "id-card";

export function useStudentDetail(studentId: string) {
  const can = useCan();
  const query = useStudent(studentId);
  const action = useDialogState<StudentAction>();
  const [tab, setTab] = useState<StudentTabId>("profile");
  const student = query.data ?? null;

  return {
    query,
    student,
    tab,
    setTab: (value: string) => setTab(value as StudentTabId),
    // Placement changes only make sense while the student is enrolled.
    canAct: can("students.edit") && student?.status === "ACTIVE",
    action,
  };
}
