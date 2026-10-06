import { useReportCard } from "./results-api";

/** Report card PDF of a student for an exam; polls while it is rendering. */
export function useReportCardPanel(studentId: string | null, examId: string | null) {
  const query = useReportCard(studentId, examId);
  const card = query.data ?? null;
  return {
    query,
    card,
    pending: card?.status === "PENDING",
    failed: card?.status === "FAILED",
    fileUrl: card?.status === "READY" ? card.fileUrl : null,
  };
}
