"use client";

import { CalendarDays, ClipboardList, FileText } from "lucide-react";
import { OptionSelect } from "@/components/shared/OptionSelect";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Exam } from "../../types";
import { usePrintTab } from "../../use-print-tab";
import { PrintActionCard } from "./PrintActionCard";

/** Bulk PDFs of an exam: report cards, date sheet and blank award lists. */
export function PrintTab({ exam }: { exam: Exam }) {
  const tab = usePrintTab(exam);
  if (tab.loading) return <Skeleton className="h-64 w-full" />;
  const noSchedule = tab.hasSchedule ? null : "Save the exam schedule first.";

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <PrintActionCard
        icon={FileText}
        title="Report cards"
        description="Every student's card, with position and behaviour & skills, in one PDF."
        blocked={tab.hasResults ? null : "Compute results first."}
        pending={tab.cards.job.pending}
        jobId={tab.cards.job.jobId}
        onPrint={() => tab.cards.job.start(tab.cards.target)}
        jobLabel="Preparing report cards"
        downloadLabel="Download cards"
        unit="card"
      >
        <OptionSelect label="Print for" options={tab.sectionTargets} value={tab.cards.target} onChange={tab.cards.setTarget} />
      </PrintActionCard>
      <PrintActionCard
        icon={CalendarDays}
        title="Date sheet"
        description="Paper dates, times and marks per class, ready to send home."
        blocked={noSchedule}
        pending={tab.dateSheet.job.pending}
        jobId={tab.dateSheet.job.jobId}
        onPrint={() => tab.dateSheet.job.start(tab.dateSheet.target)}
        jobLabel="Preparing the date sheet"
        downloadLabel="Download date sheet"
      >
        <OptionSelect label="Class" options={tab.classTargets} value={tab.dateSheet.target} onChange={tab.dateSheet.setTarget} />
      </PrintActionCard>
      <PrintActionCard
        icon={ClipboardList}
        title="Award list"
        description="Blank marks sheet with roll numbers, max marks and signature lines."
        blocked={noSchedule}
        pending={tab.award.job.pending}
        jobId={tab.award.job.jobId}
        onPrint={() => tab.award.job.start(tab.award.target, tab.award.subject)}
        jobLabel="Preparing award lists"
        downloadLabel="Download award list"
      >
        <OptionSelect label="Print for" options={tab.sectionTargets} value={tab.award.target} onChange={tab.award.setTarget} />
        <OptionSelect label="Columns" options={tab.subjectOptions} value={tab.award.subject} onChange={tab.award.setSubject} />
      </PrintActionCard>
    </div>
  );
}
