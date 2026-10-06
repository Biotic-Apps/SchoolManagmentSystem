import { useStudentResult } from "./results-api";

export function useStudentResultDrawer(studentId: string | null, examId: string | null, open: boolean) {
  const query = useStudentResult(open ? examId : null, open ? studentId : null);
  return { query, result: query.data ?? null };
}
