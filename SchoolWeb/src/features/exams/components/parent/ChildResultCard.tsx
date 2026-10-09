import { DetailList } from "@/components/shared/DetailList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EMPTY_VALUE, textOrDash } from "@/lib/format";
import { formatMarks, formatPercent } from "../../options";
import { positionText } from "../../position-text";
import type { StudentResult } from "../../types";
import { PassBadge } from "../results/PassBadge";
import { ReportCardPanel } from "../results/ReportCardPanel";
import { ResultSkillsList } from "../results/ResultSkillsList";
import { SubjectMarksTable } from "../results/SubjectMarksTable";

/** One published exam result for the parent: summary, subject marks and the report card. */
export function ChildResultCard({ result }: { result: StudentResult }) {
  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle>{result.examName ?? "Exam result"}</CardTitle>
        <PassBadge passed={result.passed} />
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <DetailList
          items={[
            { label: "Total", value: `${formatMarks(result.totalMarks)} / ${formatMarks(result.maxTotal)}` },
            { label: "Percentage", value: formatPercent(result.percent) },
            { label: "Grade", value: result.grade ?? EMPTY_VALUE },
            { label: "Position in section", value: positionText(result.position, result.sectionSize) },
            { label: "Position in class", value: positionText(result.classPosition, result.classSize) },
          ]}
        />
        <SubjectMarksTable result={result} />
        <ResultSkillsList skills={result.skills ?? []} />
        {(result.remarks || result.teacherRemark) && (
          <DetailList
            items={[
              { label: "Remarks", value: textOrDash(result.remarks) },
              { label: "Class teacher", value: textOrDash(result.teacherRemark) },
            ]}
          />
        )}
        <ReportCardPanel studentId={result.studentId} examId={result.examId} compact />
      </CardContent>
    </Card>
  );
}
