"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import type { Exam } from "../../types";
import type { useExamDetail } from "../../use-exam-detail";
import { CompletenessTab } from "../completeness/CompletenessTab";
import { MarkSheetsTab } from "../marks/MarkSheetsTab";
import { ResultsTab } from "../results/ResultsTab";
import { ScheduleTab } from "../schedule/ScheduleTab";
import { ExamOverviewTab } from "./ExamOverviewTab";

interface ExamDetailTabsProps {
  exam: Exam;
  detail: ReturnType<typeof useExamDetail>;
}

export function ExamDetailTabs({ exam, detail }: ExamDetailTabsProps) {
  return (
    <Tabs value={detail.tab} onValueChange={detail.setTab}>
      <TabsList className="max-w-full overflow-x-auto">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="schedule">Schedule</TabsTrigger>
        {detail.showMarkSheets && <TabsTrigger value="mark-sheets">Mark sheets</TabsTrigger>}
        {detail.showCompleteness && <TabsTrigger value="completeness">Completeness</TabsTrigger>}
        {detail.showResults && <TabsTrigger value="results">Results</TabsTrigger>}
      </TabsList>
      <TabsContent value="overview">
        <ExamOverviewTab exam={exam} />
      </TabsContent>
      <TabsContent value="schedule">
        <ScheduleTab exam={exam} />
      </TabsContent>
      {detail.showMarkSheets && (
        <TabsContent value="mark-sheets">
          <MarkSheetsTab exam={exam} />
        </TabsContent>
      )}
      {detail.showCompleteness && (
        <TabsContent value="completeness">
          <CompletenessTab exam={exam} />
        </TabsContent>
      )}
      {detail.showResults && (
        <TabsContent value="results">
          <ResultsTab exam={exam} />
        </TabsContent>
      )}
    </Tabs>
  );
}
