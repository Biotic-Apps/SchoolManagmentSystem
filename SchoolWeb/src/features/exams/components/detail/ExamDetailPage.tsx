"use client";

import { ErrorState } from "@/components/shared/ErrorState";
import { UnsavedChangesGuard } from "@/components/shared/UnsavedChangesGuard";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useExamDetail } from "../../use-exam-detail";
import { ExamDetailTabs } from "./ExamDetailTabs";
import { ExamHeader } from "./ExamHeader";

export function ExamDetailPage({ examId }: { examId: string }) {
  return (
    <UnsavedChangesGuard>
      <ExamDetailContent examId={examId} />
    </UnsavedChangesGuard>
  );
}

function ExamDetailContent({ examId }: { examId: string }) {
  const detail = useExamDetail(examId);
  const { exam, query } = detail;

  if (query.isLoading) return <Skeleton className="h-64 w-full" />;
  if (!exam) {
    return (
      <Card>
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ExamHeader exam={exam} onBack={detail.back} />
      <ExamDetailTabs exam={exam} detail={detail} />
    </div>
  );
}
