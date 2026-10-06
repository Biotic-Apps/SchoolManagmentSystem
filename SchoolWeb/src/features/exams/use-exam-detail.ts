import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGuardedAction } from "@/components/shared/UnsavedChangesGuard";
import { useCan } from "@/features/auth/use-can";
import { useExam } from "./exams-api";
import { reached } from "./options";

export type ExamTabId = "overview" | "schedule" | "mark-sheets" | "completeness" | "results";

/** Exam page: tabs switch (and leave) only after unsaved schedule edits are confirmed. */
export function useExamDetail(examId: string) {
  const can = useCan();
  const router = useRouter();
  const guard = useGuardedAction();
  const query = useExam(examId);
  const [tab, setTab] = useState<ExamTabId>("overview");
  const exam = query.data ?? null;

  const marksStarted = !!exam && reached(exam.status, "MARKS_OPEN");
  // Approvers see results once computed; everyone else after approval.
  const showResults =
    !!exam &&
    (reached(exam.status, "RESULTS_APPROVED") ||
      (can("exams.approve") && (!!exam.computedAt || reached(exam.status, "MARKS_CLOSED"))));

  return {
    query,
    exam,
    tab,
    setTab: (value: string) => guard(() => setTab(value as ExamTabId)),
    back: () => guard(() => router.push("/exams")),
    showMarkSheets: marksStarted,
    showCompleteness: marksStarted,
    showResults,
  };
}
