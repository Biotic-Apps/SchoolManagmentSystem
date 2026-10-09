"use client";

import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { DetailList } from "@/components/shared/DetailList";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Skeleton } from "@/components/ui/Skeleton";
import { EMPTY_VALUE, textOrDash } from "@/lib/format";
import { formatPercent } from "../../options";
import { positionText } from "../../position-text";
import { useStudentResultDrawer } from "../../use-student-result-drawer";
import { ReportCardPanel } from "./ReportCardPanel";
import { SubjectMarksTable } from "./SubjectMarksTable";

interface StudentResultDrawerProps {
  studentId: string | null;
  examId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentResultDrawer({ studentId, examId, open, onOpenChange }: StudentResultDrawerProps) {
  const { query, result } = useStudentResultDrawer(studentId, examId, open);
  const caption = result
    ? [result.examName, result.rollNo != null ? `Roll no ${result.rollNo}` : null].filter(Boolean).join(" · ")
    : undefined;

  return (
    <DetailDrawer open={open} onOpenChange={onOpenChange} title={result?.name ?? "Result"} description={caption}>
      {query.isLoading && <Skeleton className="h-48 w-full" />}
      {!!query.error && <ErrorState error={query.error} onRetry={() => query.refetch()} />}
      {!query.isLoading && !query.error && !result && (
        <EmptyState title="No result" description="This student has no computed result for this exam." />
      )}
      {result && (
        <>
          <DetailList
            items={[
              { label: "Percentage", value: formatPercent(result.percent) },
              { label: "Grade", value: result.grade ?? EMPTY_VALUE },
              { label: "Position in section", value: positionText(result.position, result.sectionSize) },
              { label: "Position in class", value: positionText(result.classPosition, result.classSize) },
              { label: "Result", value: result.passed ? "Pass" : "Fail" },
            ]}
          />
          <SubjectMarksTable result={result} />
          <section className="flex flex-col gap-3">
            <SectionHeading title="Remarks" />
            <DetailList
              items={[
                { label: "Result remarks", value: textOrDash(result.remarks) },
                { label: "Class teacher", value: textOrDash(result.teacherRemark) },
              ]}
            />
          </section>
          <section className="flex flex-col gap-3">
            <SectionHeading title="Report card" />
            <ReportCardPanel studentId={studentId} examId={examId} />
          </section>
        </>
      )}
    </DetailDrawer>
  );
}
