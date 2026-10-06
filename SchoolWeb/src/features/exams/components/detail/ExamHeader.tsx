import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StatusStepper } from "@/components/shared/StatusStepper";
import { Card, CardContent } from "@/components/ui/Card";
import { EXAM_STEPS, examStatusLabel, examTypeLabel } from "../../options";
import type { Exam } from "../../types";

export function ExamHeader({ exam, onBack }: { exam: Exam; onBack: () => void }) {
  const caption = [examTypeLabel(exam.type), exam.classes?.map((item) => item.name).join(", ")].filter(Boolean).join(" · ");

  return (
    <header className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 self-start text-label text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" />
        Exams
      </button>
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-page-title font-semibold tracking-tight text-fg">{exam.name}</h1>
          <StatusBadge status={exam.status} label={examStatusLabel(exam.status)} />
        </div>
        {caption && <p className="text-label text-fg-muted">{caption}</p>}
      </div>
      <Card>
        <CardContent>
          <StatusStepper steps={EXAM_STEPS} current={exam.status} />
        </CardContent>
      </Card>
    </header>
  );
}
