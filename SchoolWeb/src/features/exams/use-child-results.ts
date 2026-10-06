import { useActiveChild } from "@/features/auth/use-active-child";
import { toNumber } from "./options";
import { useStudentResults } from "./results-api";

export interface TrendPoint {
  examId: string;
  examName: string;
  percent: number;
}

/** PARENT: published results of the Topbar child with the percent trend across exams. */
export function useChildResults() {
  const child = useActiveChild();
  const query = useStudentResults(child?.id ?? null);
  const results = query.data?.results ?? [];
  const names = new Map(results.map((result) => [result.examId, result.examName ?? ""]));

  const trend: TrendPoint[] = (query.data?.trend ?? []).map((point) => ({
    examId: point.examId,
    examName: point.examName || names.get(point.examId) || "Exam",
    percent: toNumber(point.percent) ?? 0,
  }));

  return {
    child,
    query,
    results,
    trend,
    caption: child ? [child.name, child.className, child.sectionName].filter(Boolean).join(" · ") : undefined,
  };
}
