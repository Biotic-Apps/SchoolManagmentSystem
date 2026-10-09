import { useState } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { useSectionOptions } from "@/features/classes/sections-api";
import { useExamPrint, type ExamPrintKind } from "./print-api";
import { targetInput, targetOptions } from "./print-targets";
import type { Exam } from "./types";

const ALL_SUBJECTS = "all";

/** One print card: its chosen target and the job it started. */
function usePrintJob(examId: string, kind: ExamPrintKind) {
  const print = useExamPrint(examId);
  const [jobId, setJobId] = useState<string | null>(null);
  return {
    jobId,
    pending: print.isPending,
    start: (target: string, subjectId?: string) => {
      setJobId(null);
      print.mutate(
        { kind, ...targetInput(target), subjectId: subjectId && subjectId !== ALL_SUBJECTS ? subjectId : undefined },
        { onSuccess: (data) => setJobId(data?.jobId ?? null) },
      );
    },
  };
}

/** Exam Print tab: bulk report cards, date sheets and blank award lists. */
export function usePrintTab(exam: Exam) {
  const sectionQuery = useSectionOptions(exam.branchId, exam.sessionId);
  const classIds = new Set(exam.classIds ?? []);
  const sections = sectionQuery.sections.filter((section) => classIds.has(section.classId));
  const classes: Option[] = (exam.classes ?? []).filter((item) => classIds.has(item.id));
  const subjects = new Map<string, string>();
  for (const paper of exam.papers ?? []) {
    const id = paper.subjectId ?? paper.subject?.id;
    if (id) subjects.set(id, paper.subjectName ?? paper.subject?.name ?? "");
  }

  const [cardsTarget, setCardsTarget] = useState("all");
  const [sheetTarget, setSheetTarget] = useState("all");
  const [awardTarget, setAwardTarget] = useState(sections[0] ? `section:${sections[0].id}` : "all");
  const [awardSubject, setAwardSubject] = useState(ALL_SUBJECTS);
  const cardsJob = usePrintJob(exam.id, "REPORT_CARDS");
  const sheetJob = usePrintJob(exam.id, "DATE_SHEET");
  const awardJob = usePrintJob(exam.id, "AWARD_LIST");

  return {
    loading: sectionQuery.isLoading,
    hasResults: !!exam.computedAt,
    hasSchedule: (exam.papers?.length ?? 0) > 0,
    sectionTargets: targetOptions(classes, sections),
    classTargets: targetOptions(classes, sections, false),
    subjectOptions: [
      { id: ALL_SUBJECTS, name: "All subjects (one column each)" },
      ...[...subjects].map(([id, name]) => ({ id, name: `${name} only` })),
    ] as Option[],
    cards: { target: cardsTarget, setTarget: setCardsTarget, job: cardsJob },
    dateSheet: { target: sheetTarget, setTarget: setSheetTarget, job: sheetJob },
    award: {
      target: awardTarget,
      setTarget: setAwardTarget,
      subject: awardSubject,
      setSubject: setAwardSubject,
      job: awardJob,
    },
  };
}
