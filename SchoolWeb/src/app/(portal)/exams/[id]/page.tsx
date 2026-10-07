import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { ExamDetailPage } from "@/features/exams/components/detail/ExamDetailPage";

export const metadata: Metadata = { title: "Exam" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ModuleGuard moduleId="exams" detail>
      <ExamDetailPage examId={id} />
    </ModuleGuard>
  );
}
