import { DetailList } from "@/components/shared/DetailList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EMPTY_VALUE, formatDateTime } from "@/lib/format";
import { examStatusLabel, examTypeLabel } from "../../options";
import type { Exam } from "../../types";
import { ExamStatusControls } from "./ExamStatusControls";

export function ExamOverviewTab({ exam }: { exam: Exam }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailList
            items={[
              { label: "Type", value: examTypeLabel(exam.type) },
              { label: "Status", value: examStatusLabel(exam.status) },
              { label: "Grading scheme", value: exam.gradingScheme?.name ?? EMPTY_VALUE },
              { label: "Weight", value: exam.weightPercent != null ? `${exam.weightPercent}%` : "Not weighted" },
              { label: "Classes", value: exam.classes?.map((item) => item.name).join(", ") || `${exam.classIds?.length ?? 0} classes` },
              { label: "Papers scheduled", value: exam.papers ? String(exam.papers.length) : EMPTY_VALUE },
              { label: "Results computed", value: formatDateTime(exam.computedAt) },
              { label: "Published", value: formatDateTime(exam.publishedAt) },
            ]}
          />
        </CardContent>
      </Card>
      <ExamStatusControls exam={exam} />
    </div>
  );
}
