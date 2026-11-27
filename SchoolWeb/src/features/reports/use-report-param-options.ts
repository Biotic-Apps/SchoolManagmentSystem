import { useQuery } from "@tanstack/react-query";
import type { Option } from "@/components/shared/OptionSelect";
import { useActiveBranches } from "@/features/branches/api";
import { useBranchPicker } from "@/features/branches/use-branch-picker";
import { useClassOptions } from "@/features/classes/api";
import { useSectionOptions } from "@/features/classes/sections-api";
import type { Exam } from "@/features/exams/types";
import { useSchoolOptions } from "@/features/schools/api";
import { useSessionOptions } from "@/features/sessions/api";
import { http } from "@/lib/http";
import { reportKeys } from "./api";
import type { Report, ReportParamType } from "./types";

/**
 * Exams of the picked branch, or of every branch in scope when the report has no branch param
 * (results analysis takes only the exam); the branch name is added when several branches show.
 */
function useExamOptions(branchId: string | null, enabled: boolean, branchName: (id: string) => string | null): Option[] {
  const query = useQuery({
    queryKey: reportKeys.examOptions(branchId),
    queryFn: async () => (await http.get<Exam[]>("/exams", { branchId, page: 1, pageSize: 100 })).data,
    enabled,
  });
  const exams = query.data ?? [];
  const multiBranch = new Set(exams.map((exam) => exam.branchId)).size > 1;
  return exams.map((exam) => {
    const branch = multiBranch ? branchName(exam.branchId) : null;
    return { id: exam.id, name: branch ? `${exam.name} · ${branch}` : exam.name };
  });
}

/** Choices for branch / session / class / section / exam params, following the picked branch and session. */
export function useReportParamOptions(report: Report, branchId: string | null, sessionId: string | null) {
  const uses = (type: ReportParamType) => report.params.some((param) => param.type === type);
  const picker = useBranchPicker();
  const { branches } = useActiveBranches();
  const schoolId = branches.find((branch) => branch.id === branchId)?.schoolId ?? picker.schoolId;
  const needsSession = uses("session") || uses("section");
  const sessions = useSessionOptions(needsSession ? branchId : null);
  const classes = useClassOptions(uses("class") ? schoolId : null);
  const sections = useSectionOptions(uses("section") ? branchId : null, sessionId ?? sessions.activeId);
  const schools = useSchoolOptions(uses("school"));
  const examBranchId = uses("branch") ? branchId : null;
  const branchName = (id: string) => branches.find((branch) => branch.id === id)?.name ?? null;
  const exams = useExamOptions(examBranchId, uses("exam"), branchName);

  const byType: Partial<Record<ReportParamType, Option[]>> = {
    school: schools.options,
    branch: picker.options,
    session: sessions.options,
    class: classes.options,
    section: sections.options,
    exam: exams,
  };
  return (type: ReportParamType): Option[] => byType[type] ?? [];
}
