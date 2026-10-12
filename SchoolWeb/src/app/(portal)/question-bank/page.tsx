import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { QuestionBankRoute } from "@/features/question-bank/components/QuestionBankRoute";

export const metadata: Metadata = { title: "Question Bank & Papers" };

export default function Page() {
  return (
    <ModuleGuard moduleId="question_bank">
      <QuestionBankRoute />
    </ModuleGuard>
  );
}
