import { useQuery } from "@tanstack/react-query";
import type { Option } from "@/components/shared/OptionSelect";
import { useActiveBranches } from "@/features/branches/api";
import { useBranchPicker } from "@/features/branches/use-branch-picker";
import { useClassOptions } from "@/features/classes/api";
import { useSectionOptions } from "@/features/classes/sections-api";
import type { Exam } from "@/features/exams/types";
import { useSessionOptions } from "@/features/sessions/api";
import { http } from "@/lib/http";
import { reportKeys } from "./api";
import type { Report, ReportParamType } from "./types";

function useExamOptions(branchId: string | null, enabled: boolean): Option[] {
  const query = useQuery({
    queryKey: reportKeys.examOptions(branchId),
    queryFn: async () => (await http.get<Exam[]>("/exams", { branchId, page: 1, pageSize: 100 })).data,
    enabled: enabled && !!branchId,
  });
  return (query.data ?? []).map((exam) => ({ id: exam.id, name: exam.name }));
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
  const exams = useExamOptions(branchId, uses("exam"));

  const byType: Partial<Record<ReportParamType, Option[]>> = {
    branch: picker.options,
    session: sessions.options,
    class: classes.options,
    section: sections.options,
    exam: exams,
  };
  return (type: ReportParamType): Option[] => byType[type] ?? [];
}
